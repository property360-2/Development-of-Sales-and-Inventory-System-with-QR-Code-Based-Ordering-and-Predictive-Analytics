<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'user_id';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = true;

    protected $fillable = [
        'name',
        'username',
        'password',
        'role',
        'contact_number',
    ];

    protected $hidden = [
        'password',
    ];

    /**
     * Audit logs for this user
     */
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class, 'user_id');
    }

    /**
     * Booted events for automatic audit logging
     */
    protected static function booted()
    {
        // When a new user is created
        static::created(function ($user) {
            AuditLog::create([
                'user_id' => Auth::id() ?? 1, // 1 = system user if no one logged in
                'action' => 'Created User: ' . $user->name . ' (' . $user->username . ')',
                'timestamp' => now(),
            ]);
        });

        // When a user is updated
        static::updated(function ($user) {
            $changes = collect($user->getChanges())->except(['updated_at', 'password']);
            AuditLog::create([
                'user_id' => Auth::id() ?? 1,
                'action' => 'Updated User: ' . $user->name . ' (' . $user->username . ')'
                    . ' | Changes: ' . json_encode($changes),
                'timestamp' => now(),
            ]);
        });

        // When a user is deleted
        static::deleted(function ($user) {
            AuditLog::create([
                'user_id' => Auth::id() ?? 1,
                'action' => 'Deleted User: ' . $user->name . ' (' . $user->username . ')',
                'timestamp' => now(),
            ]);
        });
    }
}
