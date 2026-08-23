export function Skeleton() {
  return (
    <main className="px-6 py-12 max-w-4xl mx-auto">
      <div className="mb-10">
        <div className="h-8 w-48 bg-surface-card rounded-xl animate-pulse" />
        <div className="h-4 w-64 bg-surface-card rounded-lg animate-pulse mt-2" />
      </div>

      <section className="mb-8">
        <div className="h-4 w-16 bg-surface-card rounded animate-pulse mb-3" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface-card rounded-3xl p-6 border border-surface-border h-56" />
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="bg-surface-card rounded-3xl p-8 border border-surface-border h-96" />
      </section>

      <section className="mb-8">
        <div className="h-4 w-20 bg-surface-card rounded animate-pulse mb-3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface-card rounded-3xl p-6 border border-surface-border h-28" />
          ))}
        </div>
      </section>
    </main>
  );
}
