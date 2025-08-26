<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class Customer extends Model
{
    use HasFactory;

    protected $table = 'customers';
    protected $primaryKey = 'customer_id';
    public $timestamps = true;

    protected $fillable = [
        'customer_name',
        'table_number',
        'order_reference',
    ];

    // ----- Audit Logging -----
    protected static function booted()
    {
        static::created(function ($customer) {
            AuditLog::create([
                'user_id' => Auth::id() ?? 0,
                'action' => 'Created Customer ID: '.$customer->customer_id,
                'timestamp' => now(),
            ]);
        });

        static::updated(function ($customer) {
            $changes = $customer->getChanges(); // only changed fields
            AuditLog::create([
                'user_id' => Auth::id() ?? 0,
                'action' => 'Updated Customer ID: '.$customer->customer_id.' | Changes: '.json_encode($changes),
                'timestamp' => now(),
            ]);
        });

        static::deleted(function ($customer) {
            AuditLog::create([
                'user_id' => Auth::id() ?? 0,
                'action' => 'Deleted Customer ID: '.$customer->customer_id,
                'timestamp' => now(),
            ]);
        });
    }
}
