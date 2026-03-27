import { eq, desc } from "drizzle-orm";
import { getDb } from "./_core/db";
import { clients, loans, osintResults, calls, promises, activityLogs } from "../drizzle/schema";
import type { InsertClient, Client, InsertLoan, Loan, InsertOSINTResult, InsertActivityLog } from "../drizzle/schema";

export async function createClient(data: InsertClient): Promise<Client | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    await db.insert(clients).values(data);
    const result = await db.select().from(clients).where(eq(clients.phone, data.phone)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Error creating client:", error);
    throw error;
  }
}

export async function getClientById(id: string): Promise<Client | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Error getting client:", error);
    throw error;
  }
}

export async function getAllClients(): Promise<Client[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  } catch (error) {
    console.error("Error getting all clients:", error);
    return [];
  }
}

export async function searchClients(query: string): Promise<Client[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    const allClients = await db.select().from(clients);
    const lowerQuery = query.toLowerCase();
    return allClients.filter((c: any) =>
      (c.customerName?.toLowerCase().includes(lowerQuery)) ||
      (c.phone?.toLowerCase().includes(lowerQuery)) ||
      (c.email?.toLowerCase().includes(lowerQuery)) ||
      (c.company?.toLowerCase().includes(lowerQuery))
    );
  } catch (error) {
    console.error("Error searching clients:", error);
    return [];
  }
}

export async function updateClient(id: string, data: Partial<InsertClient>): Promise<Client | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    await db.update(clients).set(data).where(eq(clients.id, id));
    const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Error updating client:", error);
    throw error;
  }
}

export async function deleteClient(id: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    await db.delete(clients).where(eq(clients.id, id));
    return true;
  } catch (error) {
    console.error("Error deleting client:", error);
    return false;
  }
}

export async function createLoan(data: InsertLoan): Promise<Loan | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    await db.insert(loans).values(data);
    const result = await db.select().from(loans).where(eq(loans.clientId, data.clientId)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Error creating loan:", error);
    throw error;
  }
}

export async function getLoansByClientId(clientId: string): Promise<Loan[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(loans).where(eq(loans.clientId, clientId));
  } catch (error) {
    console.error("Error getting loans:", error);
    return [];
  }
}

export async function updateLoan(id: string, data: Partial<InsertLoan>): Promise<Loan | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    await db.update(loans).set(data).where(eq(loans.id, id));
    const result = await db.select().from(loans).where(eq(loans.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Error updating loan:", error);
    throw error;
  }
}

export async function deleteLoan(id: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    await db.delete(loans).where(eq(loans.id, id));
    return true;
  } catch (error) {
    console.error("Error deleting loan:", error);
    return false;
  }
}

export async function createOSINTResult(data: InsertOSINTResult): Promise<any | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    await db.insert(osintResults).values(data);
    const result = await db.select().from(osintResults).where(eq(osintResults.clientId, data.clientId)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Error creating OSINT result:", error);
    throw error;
  }
}

export async function getOSINTResultByClientId(clientId: string): Promise<any | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(osintResults).where(eq(osintResults.clientId, clientId)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Error getting OSINT result:", error);
    return null;
  }
}

export async function updateOSINTResult(id: string, data: Partial<InsertOSINTResult>): Promise<any | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    await db.update(osintResults).set(data).where(eq(osintResults.id, id));
    const result = await db.select().from(osintResults).where(eq(osintResults.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Error updating OSINT result:", error);
    throw error;
  }
}

export async function logActivity(data: InsertActivityLog): Promise<any | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    await db.insert(activityLogs).values(data);
    return data;
  } catch (error) {
    console.error("Error logging activity:", error);
    return null;
  }
}

export async function getActivityLogs(clientId: string): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(activityLogs).where(eq(activityLogs.clientId, clientId)).orderBy(desc(activityLogs.createdAt));
  } catch (error) {
    console.error("Error getting activity logs:", error);
    return [];
  }
}

export async function getDashboardMetrics(): Promise<any> {
  try {
    const db = await getDb();
    if (!db) return null;
    const allClients = await db.select().from(clients);
    const allLoans = await db.select().from(loans);
    const totalClients = allClients.length;
    const activeAccounts = allClients.filter((c: any) => c.accountType === "Active").length;
    const writtenOffAccounts = allClients.filter((c: any) => c.accountType === "Written Off").length;
    const overdueAccounts = allClients.filter((c: any) => c.promiseStatus === "Broken").length;
    const totalBalance = allLoans.reduce((sum: number, loan: any) => sum + (parseFloat(loan.balance as any) || 0), 0);
    const totalAmountDue = allLoans.reduce((sum: number, loan: any) => sum + (parseFloat(loan.amountDue as any) || 0), 0);
    return {
      totalClients,
      activeAccounts,
      writtenOffAccounts,
      overdueAccounts,
      totalBalance,
      totalAmountDue,
      highRiskClients: allClients.filter((c: any) => c.promiseStatus === "Broken").length,
    };
  } catch (error) {
    console.error("Error getting dashboard metrics:", error);
    return null;
  }
}
