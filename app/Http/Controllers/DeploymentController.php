<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Process;

class DeploymentController extends Controller
{
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'github_url' => 'required|url',
            'project_name' => 'required|string|unique:sites,project_name',
            'is_dockerized' => 'required|in:yes,no',
        ]);

        $site = \App\Models\Site::create($validatedData);
        $user = Auth::user();

        $tenantPath = config('berrypanel.berrypanel_tenants_path') . '/' . $user->username;
        if (!File::exists($tenantPath)) {
            File::makeDirectory($tenantPath, 0755, true);
        }

        $sitePath = $tenantPath . '/' . $site->project_name;
        if (!File::exists($sitePath)) {
            File::makeDirectory($sitePath, 0755, true);
        }

        $result = Process::path($sitePath)
            ->run(['git', 'clone', $validatedData['github_url'], '.']);

        if ($result->failed()) {
            return response()->json([
                'message' => 'Failed to clone repository.',
                'error' => $result->errorOutput(),
            ], 422);
        }

        $hasDockerfile = File::exists($sitePath . '/Dockerfile');

        if (!$hasDockerfile) {
            $result = Process::path($sitePath)
                ->timeout(300)
                ->run(['nixpacks', 'build', '.', '--name', $site->project_name]);

            if ($result->failed()) {
                return response()->json([
                    'message' => 'Nixpacks failed to build the project.',
                    'error' => $result->errorOutput(),
                ], 422);
            }
        } else {
            $result = Process::path($sitePath)
                ->timeout(300)
                ->run(['docker', 'build', '-t', $site->project_name, '.']);

            if ($result->failed()) {
                return response()->json([
                    'message' => 'Docker build failed.',
                    'error' => $result->errorOutput(),
                ], 422);
            }
        }

        return response()->json([
            'message' => 'Deployment initiated successfully.',
            'site' => $site,
        ], 201);
    }

}
