"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Lead = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  source: string;
  interestArea: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "WON" | "LOST";
  isHot: boolean;
  createdAt: string;
};

const statusOptions = ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"] as const;

export function LeadsInbox() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [sortField, setSortField] = useState<"createdAt" | "source" | "interestArea">("createdAt");

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/leads?sort=${sort}`);
      const data = (await response.json()) as { ok: boolean; leads: Lead[] };
      if (data.ok) {
        setLeads(data.leads);
      }
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const sortedLeads = [...leads].sort((a, b) => {
    if (sortField === "createdAt") {
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return sort === "asc" ? aDate - bDate : bDate - aDate;
    }

    const left = a[sortField].toLowerCase();
    const right = b[sortField].toLowerCase();
    if (left === right) {
      return 0;
    }
    if (sort === "asc") {
      return left > right ? 1 : -1;
    }
    return left < right ? 1 : -1;
  });

  const updateLead = async (id: string, payload: { status?: Lead["status"]; isHot?: boolean }) => {
    await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        ...payload,
      }),
    });
    await loadLeads();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Sort by:</span>
          <Select
            value={sortField}
            onChange={(event) => setSortField(event.target.value as "createdAt" | "source" | "interestArea")}
            className="w-[170px]"
          >
            <option value="createdAt">Date</option>
            <option value="source">Source</option>
            <option value="interestArea">Interest Area</option>
          </Select>
          <Select value={sort} onChange={(event) => setSort(event.target.value as "asc" | "desc")} className="w-[130px]">
            {sortField === "createdAt" ? (
              <>
                <option value="desc">Newest</option>
                <option value="asc">Oldest</option>
              </>
            ) : (
              <>
                <option value="asc">A-Z</option>
                <option value="desc">Z-A</option>
              </>
            )}
          </Select>
        </div>
        <Button asChild variant="outline">
          <a href="/api/admin/leads/export">Download CSV</a>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Interest</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Hot Lead</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6}>Loading leads...</TableCell>
            </TableRow>
          ) : leads.length ? (
            sortedLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>{new Date(lead.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-slate-800">{lead.fullName}</p>
                    <p className="text-xs text-slate-500">{lead.email || lead.phone || "No contact"}</p>
                  </div>
                </TableCell>
                <TableCell>{lead.source}</TableCell>
                <TableCell>{lead.interestArea}</TableCell>
                <TableCell>
                  <Select value={lead.status} onChange={(event) => updateLead(lead.id, { status: event.target.value as Lead["status"] })}>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant={lead.isHot ? "secondary" : "outline"} onClick={() => updateLead(lead.id, { isHot: !lead.isHot })}>
                    {lead.isHot ? "Hot" : "Mark Hot"}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6}>No leads found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

