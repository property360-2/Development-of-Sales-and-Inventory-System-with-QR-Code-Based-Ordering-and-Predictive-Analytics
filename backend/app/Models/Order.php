<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';
    protected $primaryKey = 'order_id';
    public $timestamps = true;

    protected $fillable = [
        'customer_id',
        'handled_by',
        'order_type',
        'status',
        'total_amount',
        'order_timestamp',
        'expiry_timestamp',
        'order_source',
    ];

    // Cast timestamps properly
    protected $casts = [
        'order_timestamp' => 'datetime',
        'expiry_timestamp' => 'datetime',
    ];

    // Relationships
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'handled_by');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'order_id');
    }

    // ----- Audit Logging -----
    protected static function booted()
    {
        static::created(function ($order) {
            $userId = Auth::id();
            AuditLog::create([
                'user_id' => $userId ?? 0,
                'action' => 'Created Order for Customer: ' . ($order->customer->customer_name ?? 'Unknown'),
                'timestamp' => now(),
            ]);
        });

        static::updated(function ($order) {
            $userId = Auth::id();
            $changes = collect($order->getChanges())->except(['updated_at']);
            AuditLog::create([
                'user_id' => $userId ?? 0,
                'action' => 'Updated Order for Customer: ' . ($order->customer->customer_name ?? 'Unknown') .
                    ' | Changes: ' . json_encode($changes),
                'timestamp' => now(),
            ]);
        });

        static::deleted(function ($order) {
            $userId = Auth::id();
            AuditLog::create([
                'user_id' => $userId ?? 0,
                'action' => 'Deleted Order for Customer: ' . ($order->customer->customer_name ?? 'Unknown'),
                'timestamp' => now(),
            ]);
        });
    }

}
