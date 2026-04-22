"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 text-center font-bold">#</TableHead>
                <TableHead className="font-bold">Equipo</TableHead>
                <TableHead className="w-12 text-center font-bold">PJ</TableHead>
                <TableHead className="w-12 text-center font-bold">PG</TableHead>
                <TableHead className="w-12 text-center font-bold">PE</TableHead>
                <TableHead className="w-12 text-center font-bold">PP</TableHead>
                <TableHead className="w-12 text-center font-bold">GF</TableHead>
                <TableHead className="w-12 text-center font-bold">GC</TableHead>
                <TableHead className="w-12 text-center font-bold">DG</TableHead>
                <TableHead className="w-14 text-center font-bold bg-primary/10">PTS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((row) => (
                <TableRow 
                  key={row.teamName}
                  className={row.position <= highlightTop ? "bg-green-50 font-medium" : ""}
                >
                  <TableCell className="text-center font-semibold">{row.position}</TableCell>
                  <TableCell className="font-medium">{row.teamName}</TableCell>
                  <TableCell className="text-center">{row.pj}</TableCell>
                  <TableCell className="text-center">{row.pg}</TableCell>
                  <TableCell className="text-center">{row.pe}</TableCell>
                  <TableCell className="text-center">{row.pp}</TableCell>
                  <TableCell className="text-center">{row.gf}</TableCell>
                  <TableCell className="text-center">{row.gc}</TableCell>
                  <TableCell className="text-center">{row.dg > 0 ? `+${row.dg}` : row.dg}</TableCell>
                  <TableCell className="text-center font-bold bg-primary/5">{row.pts}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
