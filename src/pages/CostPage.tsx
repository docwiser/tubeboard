import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDateTime, formatDualCurrency } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export function CostPage() {
  const { costHistory, totalCost, exchangeRate } = useApp();

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(costHistory.map(entry => ({
      ...entry,
      costUSD: entry.cost,
      costINR: entry.cost * exchangeRate
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cost History");
    XLSX.writeFile(wb, `tubeboard-cost-history-${new Date().toISOString()}.xlsx`);
  };

  // Group costs by project for the chart
  const projectCosts = costHistory.reduce((acc, curr) => {
    acc[curr.projectName] = (acc[curr.projectName] || 0) + curr.cost;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(projectCosts).map(([name, cost]) => ({
    name,
    cost,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cost Breakdown</h1>
          <p className="text-text-muted">Track your token usage and estimated costs.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-white/5 p-6 rounded-2xl">
          <h3 className="text-sm font-medium text-text-muted mb-2">Total Cost</h3>
          <p className="text-4xl font-bold text-primary">{formatDualCurrency(totalCost, exchangeRate)}</p>
        </div>
        <div className="bg-card border border-white/5 p-6 rounded-2xl">
          <h3 className="text-sm font-medium text-text-muted mb-2">Total Requests</h3>
          <p className="text-4xl font-bold text-white">{costHistory.length}</p>
        </div>
        <div className="bg-card border border-white/5 p-6 rounded-2xl">
          <h3 className="text-sm font-medium text-text-muted mb-2">Active Projects</h3>
          <p className="text-4xl font-bold text-secondary">{chartData.length}</p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="bg-card border border-white/5 p-6 rounded-2xl h-80">
          <h3 className="text-sm font-medium text-white mb-6">Cost by Project</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(val: number) => [formatDualCurrency(val, exchangeRate), 'Cost']}
              />
              <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#ccff00' : '#9d4edd'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-text-muted font-medium uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Model</th>
                <th className="px-6 py-4 text-right">Input Tokens</th>
                <th className="px-6 py-4 text-right">Output Tokens</th>
                <th className="px-6 py-4 text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {costHistory.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-text-muted whitespace-nowrap">
                    {formatDateTime(entry.timestamp)}
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    {entry.projectName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-white/5 text-xs font-mono">
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-muted">
                    {entry.model}
                  </td>
                  <td className="px-6 py-4 text-right text-text-muted font-mono">
                    {entry.tokens.input.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-text-muted font-mono">
                    {entry.tokens.output.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-white font-mono">
                    {formatDualCurrency(entry.cost, exchangeRate)}
                  </td>
                </tr>
              ))}
              {costHistory.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-text-muted">
                    No usage history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
