<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class Menu extends Model
{
    use HasFactory;

    protected $table = 'menus';
    protected $primaryKey = 'menu_id';
    public $timestamps = true;

    protected $fillable = [
        'name',
        'description',
        'price',
        'category',
        'availability_status',
        'product_details',
    ];

    // ----- Audit Logging -----
    protected static function booted()
    {
        static::created(function ($menu) {
            AuditLog::create([
                'user_id' => Auth::id() ?? 0,
                'action' => 'Created Menu ID: ' . $menu->menu_id,
                'timestamp' => now(),
            ]);
        });

        static::updated(function ($menu) {
            $userId = Auth::id();
            if ($userId) {
                AuditLog::create([
                    'user_id' => $userId,
                    'action' => 'Updated Menu ID: ' . $menu->menu_id,
                    'timestamp' => now(),
                ]);
            }
        });


        static::deleted(function ($menu) {
            AuditLog::create([
                'user_id' => Auth::id() ?? 0,
                'action' => 'Deleted Menu ID: ' . $menu->menu_id,
                'timestamp' => now(),
            ]);
        });
    }

}
