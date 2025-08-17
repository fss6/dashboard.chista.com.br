"use client";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Image from "next/image";
import LoadingSpinner from "../../components/LoadingSpinner";
import { buildApiUrl, getApiBaseUrl } from "../../lib/api";

export default function BatchesPage() {
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const [batches, setBatches] = useState(null);
  const [error, setError] = useState(null);

  // Busca o token namespaced
  const chistaApiToken = user?.[`${getApiBaseUrl()}/auth_token`];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  useEffect(() => {
    if (isAuthenticated && chistaApiToken) {
      fetch(buildApiUrl('/batches'), {
        headers: {
          Authorization: `Bearer ${chistaApiToken}`,
        },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Erro ao buscar batches");
          const data = await res.json();
          setBatches(data);
        })
        .catch((err) => setError(err.message));
    }
  }, [isAuthenticated, chistaApiToken]);

  if (isLoading || (isAuthenticated && !batches && !error)) {
    return (
      <LoadingSpinner 
        message="Carregando batches..." 
        subtitle="Aguarde enquanto buscamos suas informações"
      />
    );
  }
  if (error) return <div className="flex flex-col items-center justify-center min-h-screen text-red-600">Erro: {error}</div>;

  return (
    <div className="min-h-screen bg-white">
      <header className="flex flex-col items-center py-8 mb-8 border-b border-blue-100">
        <Image src="/logo.png" alt="Logo Chista" width={180} height={80} priority />
        <h1 className="text-3xl font-bold mt-4 text-[#174A8B]">Batches</h1>
      </header>
      <main className="max-w-3xl mx-auto px-4">
        {batches && Array.isArray(batches) && batches.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {batches.map((batch) => (
              <li key={batch.id} className="border border-[#174A8B] rounded-lg p-6 shadow-sm bg-blue-50 hover:bg-blue-100 transition">
                <h2 className="text-xl font-semibold text-[#174A8B] mb-2">Batch #{batch.id}</h2>
                <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">{JSON.stringify(batch, null, 2)}</pre>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500">Nenhum batch encontrado.</div>
        )}
      </main>
    </div>
  );
} 