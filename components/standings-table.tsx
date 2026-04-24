"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface StandingRow {
  position: number
  teamName: string
  pj: number
  pg: number
  pe: number
  pp: number
  gf: number
  gc: number
  dg: number
  pts: number
}

interface StandingsTableProps {
  title: string
  standings: StandingRow[]
  highlightTop?: number
}

export function StandingsTable({ title, standings, highlightTop = 2 }: StandingsTableProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-serif font-semibold text-foreground">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-12 text-center text-sm font-medium text-muted-foreground">#</TableHead>
              <TableHead className="text-sm font-medium text-muted-foreground">Equipo</TableHead>
              <TableHead className="w-10 text-center text-sm font-medium text-muted-foreground">PJ</TableHead>
              <TableHead className="w-10 text-center text-sm font-medium text-muted-foreground">G</TableHead>
              <TableHead className="w-10 text-center text-sm font-medium text-muted-foreground">E</TableHead>
              <TableHead className="w-10 text-center text-sm font-medium text-muted-foreground">P</TableHead>
              <TableHead className="w-10 text-center text-sm font-medium text-muted-foreground">GF</TableHead>
              <TableHead className="w-10 text-center text-sm font-medium text-muted-foreground">GC</TableHead>
              <TableHead className="w-12 text-center text-sm font-medium text-muted-foreground">DG</TableHead>
              <TableHead className="w-12 text-center text-sm font-semibold text-foreground">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((row, index) => (
              <TableRow
                key={row.teamName}
                className={`border-b border-border last:border-0 transition-colors ${
                  index % 2 === 1 ? "bg-muted/20" : ""
                } ${row.position <= highlightTop ? "bg-primary/5" : ""}`}
              >
                <TableCell className="text-center">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                    row.position <= highlightTop 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground"
                  }`}>
                    {row.position}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-foreground">{row.teamName}</TableCell>
                <TableCell className="text-center font-mono text-sm text-muted-foreground">{row.pj}</TableCell>
                <TableCell className="text-center font-mono text-sm text-muted-foreground">{row.pg}</TableCell>
                <TableCell className="text-center font-mono text-sm text-muted-foreground">{row.pe}</TableCell>
                <TableCell className="text-center font-mono text-sm text-muted-foreground">{row.pp}</TableCell>
                <TableCell className="text-center font-mono text-sm text-muted-foreground">{row.gf}</TableCell>
                <TableCell className="text-center font-mono text-sm text-muted-foreground">{row.gc}</TableCell>
                <TableCell className={`text-center font-mono text-sm ${
                  row.dg > 0 ? "text-accent" : row.dg < 0 ? "text-destructive" : "text-muted-foreground"
                }`}>
                  {row.dg > 0 ? `+${row.dg}` : row.dg}
                </TableCell>
                <TableCell className="text-center font-semibold text-foreground">{row.pts}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
