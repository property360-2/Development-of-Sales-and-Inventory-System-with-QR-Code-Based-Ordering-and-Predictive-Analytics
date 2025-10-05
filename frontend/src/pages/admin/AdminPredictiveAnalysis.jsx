import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosInstance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, AlertTriangle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminPredictiveAnalysis() {
  // Fetch orders from API
  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await axiosInstance.get("/orders")).data,
  });

  // Simple Moving Average (SMA) for forecasting
  const calculateSMA = (data, period) => {
    if (data.length < period) return null;
    const sum = data.slice(-period).reduce((acc, val) => acc + val, 0);
    return sum / period;
  };

  // Linear regression for trend
  const linearRegression = (data) => {
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, val) => sum + val, 0);
    const sumXY = data.reduce((sum, val, i) => sum + i * val, 0);
    const sumX2 = data.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  };

  // Process historical data
  const historicalData = useMemo(() => {
    const last30Days = [];
    const now = new Date();

    // Group orders by day
    const dailySales = {};
    orders.forEach((order) => {
      const date = new Date(order.order_timestamp || order.created_at);
      const dayKey = date.toISOString().split("T")[0];
      if (!dailySales[dayKey]) dailySales[dayKey] = 0;
      dailySales[dayKey] += Number(order.total_amount);
    });

    // Fill last 30 days (including days with no sales)
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split("T")[0];
      last30Days.push({
        date: dayKey,
        dayLabel: date.toLocaleDateString("en-PH", {
          month: "short",
          day: "numeric",
        }),
        sales: dailySales[dayKey] || 0,
      });
    }

    return last30Days;
  }, [orders]);

  // Forecast next 7 days
  const forecast = useMemo(() => {
    if (historicalData.length === 0) return [];

    const salesData = historicalData.map((d) => d.sales);
    const sma7 = calculateSMA(salesData, 7) || 0;
    const { slope, intercept } = linearRegression(salesData);

    const forecastData = [];
    const lastDate = new Date(historicalData[historicalData.length - 1].date);

    for (let i = 1; i <= 7; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + i);

      // Combine SMA and trend
      const trendValue = slope * (historicalData.length + i) + intercept;
      const forecastValue = Math.max(0, sma7 * 0.6 + trendValue * 0.4);

      forecastData.push({
        date: nextDate.toISOString().split("T")[0],
        dayLabel: nextDate.toLocaleDateString("en-PH", {
          month: "short",
          day: "numeric",
        }),
        forecast: forecastValue,
        isForecast: true,
      });
    }

    return forecastData;
  }, [historicalData]);

  // Combine historical + forecast
  const chartData = useMemo(() => {
    return [
      ...historicalData.map((d) => ({ ...d, forecast: null })),
      ...forecast.map((d) => ({ ...d, sales: null })),
    ];
  }, [historicalData, forecast]);

  // Calculate insights
  const insights = useMemo(() => {
    if (historicalData.length === 0) return null;

    const salesData = historicalData.map((d) => d.sales);
    const avgSales =
      salesData.reduce((sum, val) => sum + val, 0) / salesData.length;
    const last7DaysSales = salesData.slice(-7);
    const recentAvg = last7DaysSales.reduce((sum, val) => sum + val, 0) / 7;

    const trend = recentAvg > avgSales ? "increasing" : "decreasing";
    const trendPercent = (((recentAvg - avgSales) / avgSales) * 100).toFixed(1);

    // Peak day
    const maxSales = Math.max(...salesData);
    const maxDayIndex = salesData.indexOf(maxSales);
    const peakDay = historicalData[maxDayIndex];

    // Low day
    const minSales = Math.min(...salesData.filter((s) => s > 0));
    const minDayIndex = salesData.indexOf(minSales);
    const lowDay = historicalData[minDayIndex];

    // Forecast total
    const forecastTotal = forecast.reduce((sum, d) => sum + d.forecast, 0);

    return {
      avgSales,
      recentAvg,
      trend,
      trendPercent,
      peakDay,
      lowDay,
      forecastTotal,
    };
  }, [historicalData, forecast]);

  // Demand predictions per day of week
  const demandByDayOfWeek = useMemo(() => {
    const dayTotals = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

    historicalData.forEach((d) => {
      const date = new Date(d.date);
      const dayOfWeek = date.getDay();
      dayTotals[dayOfWeek].push(d.sales);
    });

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    return dayNames
      .map((name, idx) => {
        const sales = dayTotals[idx];
        const avg =
          sales.length > 0
            ? sales.reduce((sum, val) => sum + val, 0) / sales.length
            : 0;
        return { day: name, avgSales: avg };
      })
      .sort((a, b) => b.avgSales - a.avgSales);
  }, [historicalData]);

  const formatMoney = (value) => `₱${Number(value).toFixed(2)}`;

  if (isLoading) {
    return (
      <div className="p-6">
        <p>Loading predictive analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">Error loading data. Please try again.</p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No data available for forecasting. Start recording sales!
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Predictive Analytics</h1>
        <Badge variant="outline" className="text-sm">
          <Calendar className="w-4 h-4 mr-1" />
          7-Day Forecast
        </Badge>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sales Trend</p>
                <p className="text-2xl font-bold capitalize">
                  {insights.trend}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    insights.trend === "increasing"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {insights.trendPercent}% vs 30-day avg
                </p>
              </div>
              <TrendingUp
                className={`w-12 h-12 opacity-20 ${
                  insights.trend === "increasing"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">Peak Sales Day</p>
              <p className="text-xl font-bold">{insights.peakDay?.dayLabel}</p>
              <p className="text-sm text-green-600 mt-1">
                {formatMoney(insights.peakDay?.sales)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-muted-foreground">
                Expected Next 7 Days
              </p>
              <p className="text-2xl font-bold">
                {formatMoney(insights.forecastTotal)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Estimated revenue
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            Sales Forecast (30 Days Historical + 7 Days Prediction)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="dayLabel"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => formatMoney(value)}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />

              {/* Historical data */}
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Actual Sales"
                dot={{ r: 3 }}
              />

              {/* Forecast data */}
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Forecasted Sales"
                dot={{ r: 4, fill: "#10b981" }}
              />

              {/* Reference line for current date */}
              <ReferenceLine
                x={historicalData[historicalData.length - 1]?.dayLabel}
                stroke="red"
                strokeDasharray="3 3"
                label={{ value: "Today", position: "top" }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Forecasting Method</p>
                <p>
                  This forecast combines a 7-day Simple Moving Average (60%)
                  with linear trend analysis (40%). Accuracy improves with more
                  historical data. Use this as a guide for inventory planning
                  and staffing.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Days of Week */}
      <Card>
        <CardHeader>
          <CardTitle>Average Sales by Day of Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {demandByDayOfWeek.map((day, idx) => {
              const maxSales = Math.max(
                ...demandByDayOfWeek.map((d) => d.avgSales)
              );
              const percentage =
                maxSales > 0 ? (day.avgSales / maxSales) * 100 : 0;

              return (
                <div key={day.day} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{day.day}</span>
                    <span className="text-muted-foreground">
                      {formatMoney(day.avgSales)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-amber-50 rounded border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Tip:</strong> {demandByDayOfWeek[0]?.day} typically has
              the highest sales. Consider scheduling more staff and stocking
              extra inventory on this day.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.trend === "increasing" && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded border border-green-200">
                <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-green-900">
                    Sales are trending upward!
                  </p>
                  <p className="text-green-700 mt-1">
                    Consider increasing inventory levels by 15-20% to meet
                    expected demand.
                  </p>
                </div>
              </div>
            )}

            {insights.trend === "decreasing" && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded border border-orange-200">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-orange-900">
                    Sales are declining
                  </p>
                  <p className="text-orange-700 mt-1">
                    Review menu pricing, run promotions, or adjust staffing to
                    reduce costs.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded border border-blue-200">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900">
                  Inventory Planning
                </p>
                <p className="text-blue-700 mt-1">
                  Based on forecast, prepare for approximately{" "}
                  {formatMoney(insights.forecastTotal / 7)} in daily sales over
                  the next week.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
