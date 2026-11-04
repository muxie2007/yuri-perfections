"use client";

/**
 * One export for a list: Excel and CSV from the same rows. Excel cells are typed (real
 * dates and numbers, never formatted text) so they sort and filter in the spreadsheet.
 */
export type ExportColumn<T> = {
    header: string;
    value: (row: T) => string | number | Date | null;
    /** Column width in characters (Excel). */
    width?: number;
};

function stamp() {
    return new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
}

export async function exportExcel<T>(rows: T[], columns: ExportColumn<T>[], name: string) {
    const { default: writeXlsxFile } = await import("write-excel-file/browser");
    const header = columns.map((c) => ({ value: c.header, fontWeight: "bold" as const }));
    const body = rows.map((row) =>
        columns.map((c) => {
            const value = c.value(row);
            if (value === null || value === "") return null;
            if (value instanceof Date) return { value, type: Date, format: "dd mmm yyyy hh:mm" };
            if (typeof value === "number") return { value, type: Number };
            return { value: String(value), type: String, wrap: true };
        }),
    );
    await writeXlsxFile([header, ...body], {
        columns: columns.map((c) => ({ width: c.width ?? 20 })),
        stickyRowsCount: 1,
    }).toFile(`${name}-${stamp()}.xlsx`);
}

export function exportCsv<T>(rows: T[], columns: ExportColumn<T>[], name: string) {
    const escape = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
    const lines = [
        columns.map((c) => escape(c.header)).join(","),
        ...rows.map((row) =>
            columns
                .map((c) => {
                    const v = c.value(row);
                    if (v === null) return "";
                    return escape(v instanceof Date ? v.toISOString() : String(v));
                })
                .join(","),
        ),
    ];
    // BOM so Excel opens UTF-8 (names with accents) correctly.
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: `${name}-${stamp()}.csv` });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
