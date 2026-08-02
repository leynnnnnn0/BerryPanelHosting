<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Site extends Model
{
    /** @use HasFactory<\Database\Factories\SiteFactory> */
    use HasFactory;

    protected $fillable = [ 
        'user_id',
        'github_url',
        'project_name',
        'is_dockerized',
        'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
