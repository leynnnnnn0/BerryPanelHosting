<?php

use App\Http\Controllers\DeploymentController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');


    Route::post('deploy', [DeploymentController::class, 'store'])->name('deploy.store');
});

require __DIR__.'/settings.php';
