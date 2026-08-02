<?php

namespace App\Http\Controllers;

use App\Jobs\DeploySite;
use App\Models\Site;
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
        $validatedData['user_id'] = Auth::id();
        $site = Site::create($validatedData + ['status' => 'pending']);

        DeploySite::dispatch($site, $validatedData['github_url'], Auth::user()->username);

        return response()->json([
            'message' => 'Deployment queued.',
            'site' => $site,
        ], 202);
    }

}
