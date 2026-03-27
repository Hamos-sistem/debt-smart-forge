import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Clients Management
  clients: router({
    list: publicProcedure.query(async () => {
      return await db.getAllClients();
    }),

    getById: publicProcedure.input(z.string()).query(async ({ input }) => {
      return await db.getClientById(input);
    }),

    search: publicProcedure.input(z.string()).query(async ({ input }) => {
      return await db.searchClients(input);
    }),

    create: protectedProcedure
      .input(
        z.object({
          customerName: z.string(),
          phone: z.string(),
          email: z.string().optional(),
          company: z.string().optional(),
          address: z.string().optional(),
          accountType: z.string().optional(),
          promiseStatus: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const client = await db.createClient({
          id: crypto.randomUUID(),
          ...input,
        });
        
        if (client) {
          await notifyOwner({
            title: "عميل جديد تم إضافته",
            content: `تم إضافة عميل جديد: ${input.customerName} - ${input.phone}`,
          });
          
          await db.logActivity({
            id: crypto.randomUUID(),
            clientId: client.id,
            action: "created",
            detail: JSON.stringify({ user: ctx.user.name }),
          });
        }
        
        return client;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          customerName: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          company: z.string().optional(),
          address: z.string().optional(),
          accountType: z.string().optional(),
          promiseStatus: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const client = await db.updateClient(id, data);
        
        if (client && data.promiseStatus) {
          await notifyOwner({
            title: "تحديث حالة الوعد",
            content: `تم تحديث حالة الوعد للعميل ${client.customerName} إلى ${data.promiseStatus}`,
          });
        }
        
        return client;
      }),

    delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
      return await db.deleteClient(input);
    }),
  }),

  // Loans Management
  loans: router({
    getByClientId: publicProcedure.input(z.string()).query(async ({ input }) => {
      return await db.getLoansByClientId(input);
    }),

    create: protectedProcedure
      .input(
        z.object({
          clientId: z.string(),
          loanType: z.string().optional(),
          loanNumber: z.string().optional(),
          emi: z.string().optional(),
          bucket: z.string().optional(),
          balance: z.string().optional(),
          amountDue: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createLoan({
          id: crypto.randomUUID(),
          ...input,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          loanType: z.string().optional(),
          balance: z.string().optional(),
          amountDue: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateLoan(id, data);
      }),

    delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
      return await db.deleteLoan(input);
    }),
  }),

  // Dashboard Metrics
  dashboard: router({
    metrics: publicProcedure.query(async () => {
      return await db.getDashboardMetrics();
    }),
  }),

  // OSINT Results
  osint: router({
    getByClientId: publicProcedure.input(z.string()).query(async ({ input }) => {
      return await db.getOSINTResultByClientId(input);
    }),

    create: protectedProcedure
      .input(
        z.object({
          clientId: z.string(),
          photoUrl: z.string().optional(),
          summary: z.string().optional(),
          visualMatches: z.string().optional(),
          webResults: z.string().optional(),
          socialMedia: z.string().optional(),
          workplaceInfo: z.string().optional(),
          confidenceScore: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createOSINTResult({
          id: crypto.randomUUID(),
          ...input,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          summary: z.string().optional(),
          visualMatches: z.string().optional(),
          confidenceScore: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateOSINTResult(id, data);
      }),
  }),

  // Activity Logs
  activity: router({
    getByClientId: publicProcedure.input(z.string()).query(async ({ input }) => {
      return await db.getActivityLogs(input);
    }),

    log: protectedProcedure
      .input(
        z.object({
          clientId: z.string(),
          action: z.string(),
          detail: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.logActivity({
          id: crypto.randomUUID(),
          ...input,
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
