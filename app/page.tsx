"use client";

import { useMemo, useState } from "react";

type Unit = "g" | "kg" | "ml" | "L" | "oz" | "lb" | "unidades";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: Unit;
}

interface ComparedProduct extends Product {
  standardPrice: number;
  isBestValue: boolean;
  savingsPercentage: number;
}

const UNIT_OPTIONS: { value: Unit; label: string }[] = [
  { value: "g", label: "Gramos (g)" },
  { value: "kg", label: "Kilogramos (kg)" },
  { value: "ml", label: "Mililitros (ml)" },
  { value: "L", label: "Litros (L)" },
  { value: "oz", label: "Onzas (oz)" },
  { value: "lb", label: "Libras (lb)" },
  { value: "unidades", label: "Unidades (pz)" },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: "demo-1", name: "Arroz A", price: 2.5, quantity: 500, unit: "g" },
  { id: "demo-2", name: "Arroz B", price: 4.2, quantity: 1, unit: "kg" },
];

function parsePositiveNumber(value: string): number | null {
  const normalized = value.trim().replace(",", ".");

  if (!normalized || !/^\d+(\.\d+)?$/.test(normalized)) {
    return null;
  }

  const number = Number(normalized);

  return Number.isFinite(number) && number > 0 ? number : null;
}

function toBaseUnits(quantity: number, unit: Unit): number {
  switch (unit) {
    case "kg":
      return quantity * 1000;
    case "L":
      return quantity * 1000;
    case "lb":
      return quantity * 453.59237;
    case "oz":
      return quantity * 28.349523125;
    default:
      return quantity;
  }
}

function getStandardLabel(unit: Unit): string {
  if (unit === "unidades") return "unidad";
  if (unit === "ml" || unit === "L") return "100 ml";
  return "100 g";
}

function formatMoney(value: number): string {
  return value.toLocaleString("es-CR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });
}

function calculateProducts(products: Product[]): ComparedProduct[] {
  const validProducts = products.filter(
    (product) =>
      Number.isFinite(product.price) &&
      Number.isFinite(product.quantity) &&
      product.price > 0 &&
      product.quantity > 0,
  );

  const converted = validProducts.map((product) => {
    const baseQuantity = toBaseUnits(product.quantity, product.unit);
    const multiplier = product.unit === "unidades" ? 1 : 100;

    return {
      ...product,
      standardPrice: (product.price / baseQuantity) * multiplier,
      isBestValue: false,
      savingsPercentage: 0,
    };
  });

  converted.sort((a, b) => a.standardPrice - b.standardPrice);

  if (converted.length === 0) return [];

  const bestPrice = converted[0].standardPrice;

  return converted.map((product, index) => ({
    ...product,
    isBestValue: index === 0,
    savingsPercentage:
      index === 0
        ? 0
        : Math.round(
            ((product.standardPrice - bestPrice) / product.standardPrice) * 100,
          ),
  }));
}

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20";

const buttonClass =
  "rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

export default function Home() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<Unit>("g");
  const [error, setError] = useState("");

  const comparedProducts = useMemo(
    () => calculateProducts(products),
    [products],
  );

  function handleAddProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    alert("El formulario sí está funcionando");

    const parsedPrice = parsePositiveNumber(price);
    const parsedQuantity = parsePositiveNumber(quantity);

    if (parsedPrice === null || parsedQuantity === null) {
      setError("Escribe un precio y una cantidad mayores que cero.");
      return;
    }

    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: name.trim() || `Producto ${products.length + 1}`,
      price: parsedPrice,
      quantity: parsedQuantity,
      unit,
    };

    setProducts((current) => [...current, newProduct]);

    setName("");
    setPrice("");
    setQuantity("");
    setUnit("g");
  }

  function handleDeleteProduct(id: string) {
    setProducts((current) => current.filter((product) => product.id !== id));
    setError("");
  }

  function handleClearProducts() {
    setProducts([]);
    setError("");
  }

  function handleRestoreExamples() {
    setProducts(INITIAL_PRODUCTS.map((product) => ({ ...product })));
    setError("");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-xl">
        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-3xl">
            🛒
          </div>
          <h1 className="text-3xl font-black tracking-tight text-emerald-400">
            UnitSmart
          </h1>
          <h1 style={{ color: "red", fontSize: 32 }}>UNITSMART - PRUEBA 123</h1>
          <p className="mt-2 text-sm text-slate-400">
            Compara precios y descubre cuál producto conviene más.
          </p>
        </header>

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <h2 className="mb-4 text-lg font-bold">Agregar producto</h2>

          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label
                htmlFor="product-name"
                className="mb-1.5 block text-sm text-slate-300"
              >
                Nombre del producto
              </label>
              <input
                id="product-name"
                className={inputClass}
                type="text"
                placeholder="Ej. Arroz, detergente..."
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="product-price"
                  className="mb-1.5 block text-sm text-slate-300"
                >
                  Precio
                </label>
                <input
                  id="product-price"
                  className={inputClass}
                  type="text"
                  inputMode="decimal"
                  placeholder="Ej. 2,50"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="product-quantity"
                  className="mb-1.5 block text-sm text-slate-300"
                >
                  Cantidad
                </label>
                <input
                  id="product-quantity"
                  className={inputClass}
                  type="text"
                  inputMode="decimal"
                  placeholder="Ej. 500"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="product-unit"
                className="mb-1.5 block text-sm text-slate-300"
              >
                Unidad de medida
              </label>
              <select
                id="product-unit"
                className={inputClass}
                value={unit}
                onChange={(event) => setUnit(event.target.value as Unit)}
              >
                {UNIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className={`${buttonClass} w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400`}
            >
              + Añadir a la comparativa
            </button>
          </form>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Comparativa de precios</h2>
              <p className="mt-1 text-xs text-slate-400">
                {products.length}{" "}
                {products.length === 1 ? "producto" : "productos"} en la lista
              </p>
            </div>

            {products.length > 0 && (
              <button
                type="button"
                onClick={handleClearProducts}
                className="rounded-lg px-3 py-2 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10"
              >
                Limpiar lista
              </button>
            )}
          </div>

          {comparedProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-5 py-12 text-center">
              <div className="text-4xl">🧺</div>
              <p className="mt-3 font-semibold">Tu lista está vacía</p>
              <p className="mt-1 text-sm text-slate-400">
                Agrega productos para comparar sus precios.
              </p>
              <button
                type="button"
                onClick={handleRestoreExamples}
                className={`${buttonClass} mt-5 border border-slate-700 text-slate-200 hover:bg-slate-800`}
              >
                Cargar productos de ejemplo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {comparedProducts.map((product) => (
                <article
                  key={product.id}
                  className={`rounded-2xl border p-4 transition ${
                    product.isBestValue
                      ? "border-emerald-500/60 bg-emerald-950/40 shadow-lg shadow-emerald-950/20"
                      : "border-slate-800 bg-slate-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="wrap-break-word font-bold">
                          {product.name}
                        </h3>
                        {product.isBestValue && (
                          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                            🏆 Mejor precio
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-400">
                        {product.quantity} {product.unit} · $
                        {formatMoney(product.price)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product.id)}
                      aria-label={`Eliminar ${product.name}`}
                      title="Eliminar producto"
                      className="shrink-0 rounded-lg px-3 py-2 text-lg text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-800 pt-3">
                    <div>
                      <p className="text-xs text-slate-400">
                        Precio por {getStandardLabel(product.unit)}
                      </p>
                      <p className="mt-1 text-2xl font-black tabular-nums">
                        ${formatMoney(product.standardPrice)}
                      </p>
                    </div>

                    {!product.isBestValue && (
                      <span className="text-right text-xs font-semibold text-rose-300">
                        {product.savingsPercentage}% más caro
                      </span>
                    )}
                    {product.isBestValue && comparedProducts.length > 1 && (
                      <span className="text-right text-xs font-semibold text-emerald-300">
                        Mejor opción
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-8 border-t border-slate-800 pt-4 text-center text-xs text-slate-500">
          UnitSmart · Compara el precio por cantidad, no solo el precio del
          envase.
        </footer>
      </div>
    </main>
  );
}
