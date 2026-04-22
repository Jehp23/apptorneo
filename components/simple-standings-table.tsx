"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface SimpleStandingRow {
  position: number;
  teamName: string;
  pj: number;
  pg: number;
  pp: number;
  pts: number;
  bonus?: number;
}

interface SimpleStandingsTableProps {
  title: string;
  standings: SimpleStandingRow[];
  highlightTop?: number;
  showBonus?: boolean;
}

export function SimpleStandingsTable({ 
  title, 
  standings, 
  highlightTop = 2,
  showBonus = false 
}: SimpleStandingsTableProps) {
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
              <TableHead className="w-10 text-center text-xs font-medium text-muted-foreground">P</TableHead>
              {showBonus && <TableHead className="w-12 text-center text-xs font-medium text-muted-foreground">Bonus</TableHead>}
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
                <TableCell className="text-center tabular-nums text-muted-foreground">{row.pp}</TableCell>
                {showBonus && <TableCell className="text-center tabular-nums">+{row.bonus || 0}</TableCell>}
                <TableCell className="text-center font-semibold tabular-nums">{row.pts}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
