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
// ----- Audit Logging -----
    protected static function booted()
    {
        static::created(function ($customer) {
            AuditLog::create([
                'user_id' => Auth::id() ?? 0,
                'action' => 'Created Customer: ' . $customer->customer_name,
                'timestamp' => now(),
            ]);
        });

        static::updated(function ($customer) {
            $changes = collect($customer->getChanges())->except(['updated_at']);
            AuditLog::create([
                'user_id' => Auth::id() ?? 0,
                'action' => 'Updated Customer: ' . $customer->customer_name . ' | Changes: ' . json_encode($changes),
                'timestamp' => now(),
            ]);
        });

        static::deleted(function ($customer) {
            AuditLog::create([
                'user_id' => Auth::id() ?? 0,
                'action' => 'Deleted Customer: ' . $customer->customer_name,
                'timestamp' => now(),
            ]);
        });
    }

}
