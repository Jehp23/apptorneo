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
                <TableHead className="w-12 text-center font-bold">PP</TableHead>
                {showBonus && <TableHead className="w-14 text-center font-bold">Bonus</TableHead>}
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
                  <TableCell className="text-center">{row.pp}</TableCell>
                  {showBonus && <TableCell className="text-center text-green-600">+{row.bonus || 0}</TableCell>}
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
