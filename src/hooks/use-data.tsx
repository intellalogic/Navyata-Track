"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Sale, Expense, TailoringOrder, InHouseDesign } from '@/lib/types';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  doc,
  updateDoc,
  Timestamp,
  query,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { useAuth } from './use-auth';

interface DataContextProps {
  sales: Sale[];
  expenses: Expense[];
  tailoringOrders: TailoringOrder[];
  designs: InHouseDesign[];
  addSale: (sale: Omit<Sale, 'id'>) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  addTailoringOrder: (order: Omit<TailoringOrder, 'id'>) => Promise<void>;
  updateTailoringOrder: (id: string, order: Partial<Omit<TailoringOrder, 'id'>>) => Promise<void>;
  addDesign: (design: Omit<InHouseDesign, 'id'>) => Promise<void>;
  loading: boolean;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

// Helper function to convert Firestore Timestamps to JS Dates in nested objects
const convertTimestampsToDates = (data: any) => {
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate();
        } else if (data[key] && typeof data[key] === 'object') {
            convertTimestampsToDates(data[key]);
        }
    }
    return data;
}

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [tailoringOrders, setTailoringOrders] = useState<TailoringOrder[]>([]);
  const [designs, setDesigns] = useState<InHouseDesign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        setSales([]);
        setExpenses([]);
        setTailoringOrders([]);
        setDesigns([]);
        setLoading(false);
        return;
    }

    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const salesQuery = query(collection(db, 'sales'), orderBy('date', 'desc'));
        const expensesQuery = query(collection(db, 'expenses'), orderBy('date', 'desc'));
        const tailoringQuery = query(collection(db, 'tailoringOrders'), orderBy('deliveryDate', 'desc'));
        const designsQuery = query(collection(db, 'designs'), orderBy('startDate', 'desc'));

        const [salesSnapshot, expensesSnapshot, tailoringSnapshot, designsSnapshot] = await Promise.all([
            getDocs(salesQuery),
            getDocs(expensesQuery),
            getDocs(tailoringQuery),
            getDocs(designsQuery)
        ]);

        if (isMounted) {
            const salesData = salesSnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestampsToDates(doc.data()) })) as Sale[];
            const expensesData = expensesSnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestampsToDates(doc.data()) })) as Expense[];
            const tailoringData = tailoringSnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestampsToDates(doc.data()) })) as TailoringOrder[];
            const designsData = designsSnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestampsToDates(doc.data()) })) as InHouseDesign[];
            
            setSales(salesData);
            setExpenses(expensesData);
            setTailoringOrders(tailoringData);
            setDesigns(designsData);
        }
      } catch (error) {
          console.error("Failed to fetch initial data:", error);
      } finally {
          if (isMounted) {
            setLoading(false);
          }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const addSale = async (sale: Omit<Sale, 'id'>) => {
    const docRef = await addDoc(collection(db, 'sales'), sale);
    const newSale = { ...sale, id: docRef.id } as Sale;
    setSales(prev => [newSale, ...prev].sort((a,b) => b.date.getTime() - a.date.getTime()));
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const docRef = await addDoc(collection(db, 'expenses'), expense);
    const newExpense = { ...expense, id: docRef.id } as Expense;
    setExpenses(prev => [newExpense, ...prev].sort((a,b) => b.date.getTime() - a.date.getTime()));
  };

  const addTailoringOrder = async (order: Omit<TailoringOrder, 'id'>) => {
    const docRef = await addDoc(collection(db, 'tailoringOrders'), order);
    const newOrder = { ...order, id: docRef.id } as TailoringOrder;
    setTailoringOrders(prev => [newOrder, ...prev].sort((a,b) => b.deliveryDate.getTime() - a.deliveryDate.getTime()));
  };

  const updateTailoringOrder = async (id: string, orderUpdate: Partial<Omit<TailoringOrder, 'id'>>) => {
    const orderRef = doc(db, 'tailoringOrders', id);
    await updateDoc(orderRef, orderUpdate);
    setTailoringOrders(prev => prev.map(o => o.id === id ? { ...o, ...convertTimestampsToDates(orderUpdate) } : o));
  };
  
  const addDesign = async (design: Omit<InHouseDesign, 'id'>) => {
    const docRef = await addDoc(collection(db, 'designs'), design);
    const newDesign = { ...design, id: docRef.id } as InHouseDesign;
    setDesigns(prev => [newDesign, ...prev].sort((a,b) => b.startDate.getTime() - a.startDate.getTime()));
  };

  return (
    <DataContext.Provider value={{ 
        sales, expenses, tailoringOrders, designs,
        addSale, addExpense, addTailoringOrder, addDesign,
        updateTailoringOrder,
        loading
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
