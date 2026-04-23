"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface CompactStandingRow {
  position: number
  teamName: string
  pj: number
  pg: number
  pp: number
  pts: number
}

interface CompactStandingsTableProps {
  title: string
  standings: CompactStandingRow[]
  highlightTop?: number
}

export function CompactStandingsTable({
  title,
  standings,
  highlightTop = 1,
}: CompactStandingsTableProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-serif font-semibold text-foreground text-sm">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-8 text-center text-[10px] font-medium text-muted-foreground">#</TableHead>
              <TableHead className="text-[10px] font-medium text-muted-foreground">Pareja</TableHead>
              <TableHead className="w-8 text-center text-[10px] font-medium text-muted-foreground">PJ</TableHead>
              <TableHead className="w-8 text-center text-[10px] font-medium text-muted-foreground">G</TableHead>
              <TableHead className="w-8 text-center text-[10px] font-medium text-muted-foreground">P</TableHead>
              <TableHead className="w-10 text-center text-[10px] font-semibold text-foreground">Pts</TableHead>
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
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-medium ${
                      row.position <= highlightTop
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {row.position}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-foreground text-xs">{row.teamName}</TableCell>
                <TableCell className="text-center font-mono text-xs text-muted-foreground">{row.pj}</TableCell>
                <TableCell className="text-center font-mono text-xs text-muted-foreground">{row.pg}</TableCell>
                <TableCell className="text-center font-mono text-xs text-muted-foreground">{row.pp}</TableCell>
                <TableCell className="text-center font-semibold text-foreground text-xs">{row.pts}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
