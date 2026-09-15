"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Bell, CheckCheck, LoaderCircle } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NotificationResponse = {
  id: number;
  solicitacaoId: number;
  titulo: string;
  mensagem: string;
  lida: boolean;
  dataCriacao: string;
  dataLeitura: string | null;
};

type UnreadCountResponse = {
  quantidade: number;
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const NotificationsDropdown = () => {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    [],
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [error, setError] = useState("");

  const handleAuthenticationError = useCallback(
    (response: Response) => {
      if (response.status === 401 || response.status === 403) {
        router.replace("/");
        router.refresh();
        return true;
      }

      return false;
    },
    [router],
  );

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/backend/notificacoes/nao-lidas/quantidade",
        {
          cache: "no-store",
        },
      );

      if (handleAuthenticationError(response)) {
        return;
      }

      if (!response.ok) {
        return;
      }

      const body = (await response.json()) as UnreadCountResponse;

      setUnreadCount(body.quantidade);
    } catch {
      // O próximo polling tentará novamente.
    }
  }, [handleAuthenticationError]);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/backend/notificacoes", {
        cache: "no-store",
      });

      if (handleAuthenticationError(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error("Não foi possível carregar as notificações.");
      }

      const body = (await response.json()) as NotificationResponse[];

      setNotifications(body);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as notificações.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthenticationError]);

  useEffect(() => {
    void fetchUnreadCount();

    const intervalId = window.setInterval(() => {
      void fetchUnreadCount();
    }, 15_000);

    const handleWindowFocus = () => {
      void fetchUnreadCount();
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [fetchUnreadCount]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      void Promise.all([fetchNotifications(), fetchUnreadCount()]);
    }
  };

  const markAsRead = async (notification: NotificationResponse) => {
    if (notification.lida) {
      return true;
    }

    try {
      const response = await fetch(
        `/api/backend/notificacoes/${notification.id}/ler`,
        {
          method: "PATCH",
        },
      );

      if (handleAuthenticationError(response)) {
        return false;
      }

      if (!response.ok) {
        throw new Error();
      }

      const updatedNotification =
        (await response.json()) as NotificationResponse;

      setNotifications((current) =>
        current.map((item) =>
          item.id === updatedNotification.id ? updatedNotification : item,
        ),
      );

      setUnreadCount((current) => Math.max(0, current - 1));

      return true;
    } catch {
      setError("Não foi possível marcar a notificação como lida.");

      return false;
    }
  };

  const handleNotificationClick = async (
    notification: NotificationResponse,
  ) => {
    await markAsRead(notification);

    setOpen(false);

    router.push(`/servicos/minhas-solicitacoes/${notification.solicitacaoId}`);
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || isMarkingAll) {
      return;
    }

    setIsMarkingAll(true);
    setError("");

    try {
      const response = await fetch("/api/backend/notificacoes/ler-todas", {
        method: "PATCH",
      });

      if (handleAuthenticationError(response)) {
        return;
      }

      if (!response.ok) {
        throw new Error();
      }

      const readingDate = new Date().toISOString();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          lida: true,
          dataLeitura: notification.dataLeitura ?? readingDate,
        })),
      );

      setUnreadCount(0);
    } catch {
      setError("Não foi possível marcar todas como lidas.");
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} notificações não lidas`
              : "Notificações"
          }
          className="
            relative flex h-10 w-10 cursor-pointer
            items-center justify-center rounded-full
            outline-none transition hover:bg-zinc-100
            focus-visible:ring-2 focus-visible:ring-blue-700
          "
        >
          <Bell
            className={
              unreadCount > 0
                ? "h-6 w-6 text-blue-700"
                : "h-6 w-6 text-zinc-500"
            }
          />

          {unreadCount > 0 && (
            <span
              className="
                absolute -top-1 -right-1 flex h-5 min-w-5
                items-center justify-center rounded-full
                bg-red-600 px-1 text-[10px] font-bold
                text-white
              "
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-90 overflow-hidden p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="font-semibold text-blue-950">Notificações</h2>

            <p className="text-xs text-zinc-500">
              {unreadCount === 0
                ? "Nenhuma não lida"
                : `${unreadCount} não ${unreadCount === 1 ? "lida" : "lidas"}`}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              disabled={isMarkingAll}
              onClick={() => void handleMarkAllAsRead()}
              className="
                flex items-center gap-1 text-xs font-medium
                text-blue-700 hover:underline
                disabled:cursor-not-allowed disabled:opacity-50
              "
            >
              {isMarkingAll ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5" />
              )}
              Marcar todas
            </button>
          )}
        </div>

        <div className="max-h-105 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-zinc-500">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Carregando notificações...
            </div>
          ) : error ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-red-600">{error}</p>

              <button
                type="button"
                onClick={() => void fetchNotifications()}
                className="mt-2 text-xs font-medium text-blue-700 hover:underline"
              >
                Tentar novamente
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell className="mx-auto h-8 w-8 text-zinc-300" />

              <p className="mt-3 text-sm text-zinc-500">
                Você ainda não possui notificações.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onSelect={(event) => {
                  event.preventDefault();

                  void handleNotificationClick(notification);
                }}
                className={`
                  relative cursor-pointer items-start
                  rounded-none border-b px-4 py-4
                  focus:bg-zinc-50
                  ${notification.lida ? "bg-white" : "bg-blue-50"}
                `}
              >
                {!notification.lida && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                )}

                <div className={notification.lida ? "ml-4 min-w-0" : "min-w-0"}>
                  <p className="text-sm font-semibold text-blue-950">
                    {notification.titulo}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-600">
                    {notification.mensagem}
                  </p>

                  <p className="mt-2 text-[11px] text-zinc-400">
                    {formatDate(notification.dataCriacao)}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
