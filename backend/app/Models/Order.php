<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\AuditLog; // make sure this exists
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

    // Relationships
    public function customer() {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function user() {
        return $this->belongsTo(User::class, 'handled_by');
    }

    public function items() {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function payments() {
        return $this->hasMany(Payment::class, 'order_id');
    }
    
    // ----- Audit Logging -----
    protected static function booted()
    {
        static::created(function ($order) {
            AuditLog::create([
                'user_id' => Auth::id() ?? 0, // 0 for system actions
                'action' => 'Created Order ID: '.$order->order_id,
                'timestamp' => now(),
            ]);
        });

        static::updated(function ($order) {
            $changes = $order->getChanges(); // only changed fields
            AuditLog::create([
                'user_id' => Auth::id() ?? 0,
                'action' => 'Updated Order ID: '.$order->order_id.' | Changes: '.json_encode($changes),
                'timestamp' => now(),
            ]);
        });

        static::deleted(function ($order) {
            AuditLog::create([
                'user_id' => Auth::id() ?? 0,
                'action' => 'Deleted Order ID: '.$order->order_id,
                'timestamp' => now(),
            ]);
        });
    }
}
