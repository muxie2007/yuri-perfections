"use client";

import { createContext, forwardRef, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiAlertTriangle, FiChevronLeft, FiChevronRight, FiEye, FiEyeOff, FiLoader, FiX } from "react-icons/fi";

/**
 * The dashboard's small UI kit: Tailwind only, brand navy and gold, dark mode on every
 * piece. Spinners only for saving; loading lists show shaped skeletons.
 */

export function cx(...classes: (string | false | null | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

// ── Buttons ─────────────────────────────────────────────────────────────────

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md";
    loading?: boolean;
    icon?: React.ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { variant = "secondary", size = "md", loading, icon, className, children, disabled, type = "button", ...rest },
    ref,
) {
    const variants = {
        primary: "bg-[#F5C518] text-[#181B34] hover:bg-[#e6b800] border border-[#F5C518]",
        secondary:
            "bg-white text-[#181B34] border border-slate-300 hover:border-[#181B34] dark:bg-white/5 dark:text-white dark:border-white/15 dark:hover:border-white/40",
        ghost: "text-slate-600 hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/10 border border-transparent",
        danger: "bg-red-600 text-white hover:bg-red-700 border border-red-600",
    };
    const sizes = { sm: "h-8 px-3 text-xs gap-1.5", md: "h-10 px-4 text-sm gap-2" };
    return (
        <button
            ref={ref}
            type={type}
            disabled={disabled || loading}
            className={cx(
                "inline-flex items-center justify-center font-medium rounded-md transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C518] focus-visible:ring-offset-1 dark:focus-visible:ring-offset-[#0f1124]",
                variants[variant],
                sizes[size],
                className,
            )}
            {...rest}
        >
            {loading ? <FiLoader className="animate-spin" aria-hidden /> : icon}
            {children}
        </button>
    );
});

// ── Form fields ─────────────────────────────────────────────────────────────

export const inputClass =
    "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-[#181B34] placeholder-slate-400 focus:outline-none focus:border-[#181B34] focus:ring-2 focus:ring-[#F5C518]/40 dark:bg-white/5 dark:border-white/15 dark:text-white dark:placeholder-white/30 dark:focus:border-[#F5C518] aria-[invalid=true]:border-red-500 disabled:opacity-60";

/** Full width unless the caller gives a width (w-..., flex-1): two widths would fight. */
function widthOf(className?: string) {
    return className && /(^|\s)(w-|flex-1|flex-auto)/.test(className) ? "" : "w-full";
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cx(inputClass, "h-10", widthOf(className), className)} {...rest} />;
});

/** A password box with an eye to show or hide what was typed. */
export const PasswordInput = forwardRef<HTMLInputElement, Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">>(function PasswordInput(
    { className, ...rest },
    ref,
) {
    const [show, setShow] = useState(false);
    return (
        <div className={cx("relative", widthOf(className))}>
            <input ref={ref} type={show ? "text" : "password"} className={cx(inputClass, "h-10 w-full pr-10", className)} {...rest} />
            <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded text-slate-500 hover:text-[#181B34] dark:text-white/50 dark:hover:text-white"
                aria-label={show ? "Hide password" : "Show password"}
                tabIndex={-1}
            >
                {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
            </button>
        </div>
    );
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
    { className, rows = 4, ...rest },
    ref,
) {
    return <textarea ref={ref} rows={rows} className={cx(inputClass, "resize-y", widthOf(className), className)} {...rest} />;
});

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...rest }, ref) {
    return <select ref={ref} className={cx(inputClass, "h-10 pr-8", widthOf(className), className)} {...rest} />;
});

/** Label, control, hint and error. Pass the control as the child; `id` links the label. */
export function Field({
    label,
    id,
    hint,
    error,
    required,
    children,
    className,
}: {
    label: string;
    id?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-1.5">
                {label}
                {required && <span className="text-red-500"> *</span>}
            </label>
            {children}
            {error ? (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                    {error}
                </p>
            ) : (
                hint && <p className="mt-1 text-xs text-slate-500 dark:text-white/40">{hint}</p>
            )}
        </div>
    );
}

export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cx(
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C518]",
                checked ? "bg-emerald-500" : "bg-slate-300 dark:bg-white/20",
            )}
        >
            <span className={cx("inline-block h-5 w-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-5.5" : "translate-x-0.5")} />
        </button>
    );
}

// ── Layout pieces ───────────────────────────────────────────────────────────

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-[#181B34] dark:text-white">{title}</h1>
                {description && <p className="mt-1 text-sm text-slate-500 dark:text-white/50">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
        </div>
    );
}

export function Card({
    children,
    className,
    title,
    description,
    actions,
    id,
}: {
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
    actions?: React.ReactNode;
    id?: string;
}) {
    return (
        <section id={id} className={cx("rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-[#181B34]", className)}>
            {(title || actions) && (
                <header className="flex items-start justify-between gap-4 px-5 pt-5">
                    <div>
                        {title && <h2 className="font-semibold text-[#181B34] dark:text-white">{title}</h2>}
                        {description && <p className="mt-0.5 text-xs text-slate-500 dark:text-white/50">{description}</p>}
                    </div>
                    {actions}
                </header>
            )}
            <div className="p-5">{children}</div>
        </section>
    );
}

export function Badge({ tone = "slate", children }: { tone?: "slate" | "gold" | "green" | "red" | "blue"; children: React.ReactNode }) {
    const tones = {
        slate: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/70",
        gold: "bg-[#F5C518]/20 text-[#7a6200] dark:text-[#F5C518]",
        green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
        red: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
        blue: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
    };
    return <span className={cx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", tones[tone])}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
    return status === "active" ? <Badge tone="green">Live</Badge> : <Badge>Hidden</Badge>;
}

export function Skeleton({ className }: { className?: string }) {
    return <div aria-hidden className={cx("animate-pulse rounded-md bg-slate-200 dark:bg-white/10", className)} />;
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-dashed border-slate-300 dark:border-white/15 px-6 py-14 text-center">
            <p className="font-medium text-[#181B34] dark:text-white">{title}</p>
            {body && <p className="mt-1 text-sm text-slate-500 dark:text-white/50">{body}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
    return (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 flex items-start gap-3">
            <FiAlertTriangle className="mt-0.5 shrink-0" />
            <div className="flex-1">{error instanceof Error ? error.message : "Something went wrong."}</div>
            {onRetry && (
                <Button size="sm" onClick={onRetry}>
                    Try again
                </Button>
            )}
        </div>
    );
}

// ── Pagination ──────────────────────────────────────────────────────────────

/** Rows per page everywhere in the dashboard (playbook: default 5, at most 100). */
export const PAGE_SIZES = [5, 10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 5;

export function Pagination({
    page,
    pageSize,
    total,
    onPage,
    onPageSize,
    sizes = PAGE_SIZES,
}: {
    page: number;
    pageSize: number;
    total: number;
    onPage: (p: number) => void;
    onPageSize?: (s: number) => void;
    sizes?: readonly number[];
}) {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const from = total === 0 ? 0 : page * pageSize + 1;
    const to = Math.min(total, (page + 1) * pageSize);
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm text-slate-600 dark:text-white/60">
            <span>
                {from}–{to} of {total}
            </span>
            <div className="flex items-center gap-2">
                {onPageSize && (
                    <label className="flex items-center gap-2">
                        <span className="hidden sm:inline">Rows</span>
                        <Select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))} className="h-8! w-20 py-0!" aria-label="Rows per page">
                            {sizes.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </Select>
                    </label>
                )}
                <Button size="sm" variant="ghost" onClick={() => onPage(page - 1)} disabled={page === 0} aria-label="Previous page" icon={<FiChevronLeft />} />
                <span className="tabular-nums">
                    {page + 1} / {pages}
                </span>
                <Button size="sm" variant="ghost" onClick={() => onPage(page + 1)} disabled={page + 1 >= pages} aria-label="Next page" icon={<FiChevronRight />} />
            </div>
        </div>
    );
}

// ── Modal ───────────────────────────────────────────────────────────────────

/**
 * A dialog: Esc and the backdrop close it, focus moves inside, and the page behind does not
 * scroll. Closing keeps the content mounted for the fade (the parent keeps its record).
 */
export function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = "md",
    onTop = false,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    /** Above any other open dialog, and the only one Esc closes (the confirm dialog). */
    onTop?: boolean;
}) {
    const titleId = useId();
    const panel = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            if (onTop) e.stopImmediatePropagation();
            onClose();
        };
        // The top dialog listens first (capture) so Esc never closes the one beneath too.
        document.addEventListener("keydown", onKey, onTop);
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const focusable = panel.current?.querySelector<HTMLElement>("input, textarea, select, button:not([data-close])");
        focusable?.focus();
        return () => {
            document.removeEventListener("keydown", onKey, onTop);
            document.body.style.overflow = overflow;
        };
    }, [open, onClose, onTop]);

    if (!mounted) return null;
    const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };

    return createPortal(
        <div
            className={cx("fixed inset-0 flex", onTop ? "z-[100]" : "z-[90]", " items-end sm:items-center justify-center sm:p-4 transition-opacity duration-200", open ? "opacity-100" : "opacity-0 pointer-events-none")}
            aria-hidden={!open}
        >
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div
                ref={panel}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className={cx(
                    "relative w-full max-h-[92dvh] flex flex-col rounded-t-xl sm:rounded-xl bg-white dark:bg-[#181B34] shadow-2xl transition-transform duration-200",
                    widths[size],
                    open ? "translate-y-0" : "translate-y-4",
                )}
            >
                <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-200 dark:border-white/10">
                    <div className="min-w-0">
                        <h2 id={titleId} className="font-semibold text-lg text-[#181B34] dark:text-white truncate">
                            {title}
                        </h2>
                        {description && <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">{description}</p>}
                    </div>
                    <button type="button" data-close onClick={onClose} aria-label="Close" className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:text-white/60 dark:hover:bg-white/10">
                        <FiX size={18} />
                    </button>
                </header>
                <div className="overflow-y-auto px-5 py-5 flex-1">{children}</div>
                {footer && <footer className="flex flex-wrap justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-white/10">{footer}</footer>}
            </div>
        </div>,
        document.body,
    );
}

// ── Confirm dialog ──────────────────────────────────────────────────────────

type ConfirmOptions = {
    title: string;
    body?: React.ReactNode;
    confirmLabel?: string;
    tone?: "danger" | "primary";
};
const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);

/**
 * One confirm dialog for the dashboard: `const confirm = useConfirm()`, then
 * `if (await confirm({ title: "Delete this project?" })) ...`. Esc, Cancel and the backdrop say no.
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<(ConfirmOptions & { open: boolean }) | null>(null);
    const resolver = useRef<(value: boolean) => void>(undefined);

    const confirm = useCallback((options: ConfirmOptions) => {
        resolver.current?.(false);
        setState({ ...options, open: true });
        return new Promise<boolean>((resolve) => {
            resolver.current = resolve;
        });
    }, []);

    const close = useCallback((answer: boolean) => {
        resolver.current?.(answer);
        resolver.current = undefined;
        setState((s) => (s ? { ...s, open: false } : s));
    }, []);
    const cancel = useCallback(() => close(false), [close]);

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <Modal
                open={!!state?.open}
                onClose={cancel}
                title={state?.title ?? ""}
                size="sm"
                onTop
                footer={
                    <>
                        <Button variant="ghost" onClick={cancel}>
                            Cancel
                        </Button>
                        <Button variant={state?.tone === "primary" ? "primary" : "danger"} onClick={() => close(true)}>
                            {state?.confirmLabel ?? "Yes, delete"}
                        </Button>
                    </>
                }
            >
                <div className="text-sm text-slate-600 dark:text-white/70">{state?.body ?? "This cannot be undone."}</div>
            </Modal>
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const confirm = useContext(ConfirmContext);
    if (!confirm) throw new Error("useConfirm must be used inside ConfirmProvider (the dashboard shell)");
    return confirm;
}

/** A delete (or other final) button that asks in a confirm dialog before acting. */
export function ConfirmButton({
    onConfirm,
    children,
    confirmLabel = "Yes, delete",
    question = "Delete for good?",
    body,
    loading,
    size = "sm",
    icon,
}: {
    onConfirm: () => void;
    children: React.ReactNode;
    confirmLabel?: string;
    question?: string;
    body?: React.ReactNode;
    loading?: boolean;
    size?: "sm" | "md";
    icon?: React.ReactNode;
}) {
    const confirm = useConfirm();
    return (
        <Button
            size={size}
            variant="ghost"
            className="text-red-600! dark:text-red-400!"
            icon={icon}
            loading={loading}
            onClick={async () => {
                if (await confirm({ title: question, body, confirmLabel })) onConfirm();
            }}
        >
            {children}
        </Button>
    );
}
