"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface StandingRow {
  position: number;
  teamName: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
}

interface StandingsTableProps {
  title: string;
  standings: StandingRow[];
  highlightTop?: number;
}

export function StandingsTable({ title, standings, highlightTop = 2 }: StandingsTableProps) {
  return (
    <div>
      <h3 className="text-sm uppercase tracking-[0.15em] text-muted-foreground mb-6">{title}</h3>
      <div className="overflow-x-auto border border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="w-12 text-center text-xs font-medium text-muted-foreground">#</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Equipo</TableHead>
              <TableHead className="w-10 text-center text-xs font-medium text-muted-foreground">PJ</TableHead>
              <TableHead className="w-10 text-center text-xs font-medium text-muted-foreground">G</TableHead>
              <TableHead className="w-10 text-center text-xs font-medium text-muted-foreground">E</TableHead>
              <TableHead className="w-10 text-center text-xs font-medium text-muted-foreground">P</TableHead>
              <TableHead className="w-10 text-center text-xs font-medium text-muted-foreground">GF</TableHead>
              <TableHead className="w-10 text-center text-xs font-medium text-muted-foreground">GC</TableHead>
              <TableHead className="w-10 text-center text-xs font-medium text-muted-foreground">DG</TableHead>
              <TableHead className="w-12 text-center text-xs font-medium text-muted-foreground">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((row) => (
              <TableRow 
                key={row.teamName}
                className={`border-b border-border last:border-0 ${row.position <= highlightTop ? "bg-muted/30" : ""}`}
              >
                <TableCell className="text-center font-medium tabular-nums">{row.position}</TableCell>
                <TableCell className="font-medium">{row.teamName}</TableCell>
                <TableCell className="text-center tabular-nums text-muted-foreground">{row.pj}</TableCell>
                <TableCell className="text-center tabular-nums text-muted-foreground">{row.pg}</TableCell>
                <TableCell className="text-center tabular-nums text-muted-foreground">{row.pe}</TableCell>
                <TableCell className="text-center tabular-nums text-muted-foreground">{row.pp}</TableCell>
                <TableCell className="text-center tabular-nums text-muted-foreground">{row.gf}</TableCell>
                <TableCell className="text-center tabular-nums text-muted-foreground">{row.gc}</TableCell>
                <TableCell className="text-center tabular-nums text-muted-foreground">{row.dg > 0 ? `+${row.dg}` : row.dg}</TableCell>
                <TableCell className="text-center font-semibold tabular-nums">{row.pts}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
