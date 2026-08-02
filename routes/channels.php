<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Site;
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('site.{siteId}', function ($user, $siteId) {
    $site = Site::find($siteId);
    return $site && $site->user_id === $user->id;
});