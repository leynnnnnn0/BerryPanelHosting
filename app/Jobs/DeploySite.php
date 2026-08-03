<?php

namespace App\Jobs;

use App\Events\DeploymentStatusUpdated;
use App\Models\Site;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;

class DeploySite implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 600;

    public function __construct(
        public Site $site,
        public string $githubUrl,
        public string $username,
    ) {}

    public function handle(): void
    {
        $tenantPath = config('berrypanel.berrypanel_tenants_path') . '/' . $this->username;
        if (!File::exists($tenantPath)) {
            File::makeDirectory($tenantPath, 0755, true);
        }

        $sitePath = $tenantPath . '/' . $this->site->project_name;
        if (!File::exists($sitePath)) {
            File::makeDirectory($sitePath, 0755, true);
        }

        // ---- Cloning ----
        $this->updateStatus('cloning');

        $result = Process::path($sitePath)
            ->timeout(120)
            ->run(['git', 'clone', $this->githubUrl, '.']);

        if ($result->failed()) {
            $this->updateStatus('failed', $result->errorOutput());
            return;
        }

        // ---- Building ----
        $this->updateStatus('building');

        $hasDockerfile = File::exists($sitePath . '/Dockerfile');

        if (!$hasDockerfile) {
            $this->ensurePhpVersionHint($sitePath);
        }

        $result = $hasDockerfile
            ? Process::path($sitePath)->timeout(300)->run(['docker', 'build', '-t', $this->site->project_name, '.'])
            : Process::path($sitePath)->timeout(300)->run(['nixpacks', 'build', '.', '--name', $this->site->project_name]);

        if ($result->failed()) {
            $this->updateStatus('failed', $result->errorOutput());
            return;
        }

        // ---- Done ----
        $this->updateStatus('built');
    }

    /**
     * Nixpacks sometimes picks a default PHP version instead of reading
     * composer.json's actual requirement, which breaks builds for any
     * project needing PHP 8.4+. This writes an explicit nixpacks.toml
     * so Nixpacks uses the correct version.
     */
    protected function ensurePhpVersionHint(string $sitePath): void
    {
        $composerJsonPath = $sitePath . '/composer.json';

        if (!File::exists($composerJsonPath)) {
            return; // not a PHP project, nothing to do
        }

        $composerJson = json_decode(File::get($composerJsonPath), true);
        $constraint = $composerJson['require']['php'] ?? null;

        if (!$constraint) {
            return;
        }

        preg_match('/(\d+\.\d+)/', $constraint, $matches);
        $version = $matches[1] ?? '8.4';
        $nixVersion = 'php' . str_replace('.', '', $version);

        File::put($sitePath . '/nixpacks.toml', <<<TOML
        [phases.setup]
        nixPkgs = ["{$nixVersion}", "{$nixVersion}Packages.composer"]
        TOML);
    }

    protected function updateStatus(string $status, ?string $errorMessage = null): void
    {
        $this->site->update([
            'status' => $status,
            'error_message' => $errorMessage,
        ]);

        broadcast(new DeploymentStatusUpdated($this->site));
    }
}
