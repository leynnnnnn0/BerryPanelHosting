<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $sites = Auth::user()->sites()->latest()->get();

        return Inertia::render('dashboard', [
            'sites' => $sites,
        ]);
    }
}
