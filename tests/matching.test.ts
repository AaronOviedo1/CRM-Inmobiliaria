import { describe, it, expect } from "vitest";
import { scoreLeadProperty } from "../lib/services/matching";

const baseLead = {
  intent: "COMPRA" as const,
  budgetMin: null,
  budgetMax: null,
  desiredZones: [],
  propertyTypeInterests: [],
  minBedrooms: null,
  minBathrooms: null,
  mustHaves: [],
};

const baseProperty = {
  transactionType: "VENTA" as const,
  category: "CASA" as const,
  priceSale: null,
  priceRent: null,
  neighborhood: "",
  city: "Hermosillo",
  bedrooms: null,
  bathrooms: null,
  amenities: [],
  isFurnished: false,
  acceptsPets: false,
  hasPool: false,
};

describe("scoreLeadProperty", () => {
  it("debe dar 0 a un lead sin criterios vs propiedad vacía", () => {
    const { score } = scoreLeadProperty(baseLead, baseProperty);
    expect(score).toBe(10); // los must-haves vacíos dan 10 pts
  });

  it("debe dar 40 pts cuando el precio cae perfectamente en el rango", () => {
    const { score, reasons } = scoreLeadProperty(
      { ...baseLead, budgetMin: 3_000_000, budgetMax: 5_000_000 },
      { ...baseProperty, priceSale: 4_000_000 },
    );
    expect(reasons).toContain("PRICE_FIT");
    expect(score).toBeGreaterThanOrEqual(40);
  });

  it("debe dar score parcial cuando el precio supera el presupuesto hasta 15%", () => {
    const { reasons } = scoreLeadProperty(
      { ...baseLead, budgetMax: 4_000_000 },
      { ...baseProperty, priceSale: 4_500_000 },
    );
    expect(reasons).toContain("PRICE_PARTIAL");
  });

  it("no debe dar PRICE_FIT cuando el precio supera el límite >15%", () => {
    const { reasons } = scoreLeadProperty(
      { ...baseLead, budgetMax: 3_000_000 },
      { ...baseProperty, priceSale: 5_000_000 },
    );
    expect(reasons).not.toContain("PRICE_FIT");
    expect(reasons).not.toContain("PRICE_PARTIAL");
  });

  it("debe dar 25 pts por zona match", () => {
    const { score, reasons } = scoreLeadProperty(
      { ...baseLead, desiredZones: ["Country Club"] },
      { ...baseProperty, neighborhood: "country club" },
    );
    expect(reasons).toContain("ZONE_FIT");
    expect(score).toBeGreaterThanOrEqual(25);
  });

  it("debe dar 15 pts por tipo de propiedad match", () => {
    const { score, reasons } = scoreLeadProperty(
      { ...baseLead, propertyTypeInterests: ["CASA"] },
      { ...baseProperty, category: "CASA" },
    );
    expect(reasons).toContain("TYPE_FIT");
    expect(score).toBeGreaterThanOrEqual(15);
  });

  it("debe dar 5 pts por bedrooms y 5 por bathrooms match", () => {
    const { score, reasons } = scoreLeadProperty(
      { ...baseLead, minBedrooms: 3, minBathrooms: 2 },
      { ...baseProperty, bedrooms: 4, bathrooms: 3 },
    );
    expect(reasons).toContain("BEDROOMS_FIT");
    expect(reasons).toContain("BATHROOMS_FIT");
    expect(score).toBeGreaterThanOrEqual(10);
  });

  it("debe fallar BEDROOMS_FIT cuando property tiene menos recámaras que el mínimo", () => {
    const { reasons } = scoreLeadProperty(
      { ...baseLead, minBedrooms: 4 },
      { ...baseProperty, bedrooms: 2 },
    );
    expect(reasons).not.toContain("BEDROOMS_FIT");
  });

  it("debe dar 10 pts por must-haves todos presentes", () => {
    const { score, reasons } = scoreLeadProperty(
      { ...baseLead, mustHaves: ["alberca", "amueblado"] },
      { ...baseProperty, hasPool: true, isFurnished: true },
    );
    expect(reasons).toContain("MUST_HAVES_FIT");
    expect(score).toBeGreaterThanOrEqual(10);
  });

  it("score perfecto = 100 para un lead que calza en todo", () => {
    const { score } = scoreLeadProperty(
      {
        ...baseLead,
        budgetMin: 3_000_000,
        budgetMax: 5_000_000,
        desiredZones: ["country club"],
        propertyTypeInterests: ["CASA"],
        minBedrooms: 3,
        minBathrooms: 2,
        mustHaves: ["alberca"],
      },
      {
        ...baseProperty,
        priceSale: 4_000_000,
        neighborhood: "country club",
        category: "CASA",
        bedrooms: 4,
        bathrooms: 3,
        hasPool: true,
      },
    );
    expect(score).toBe(100);
  });
});
