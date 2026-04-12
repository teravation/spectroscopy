/**
 * Wavelength conversions between vacuum and standard air at STP.
 *
 * Uses the Edlén (1966) formula as documented in ELEMENTS.md:
 *   n_air = 1 + 8.34213×10⁻⁵ + 2.40603×10⁻²/(130 − σ²) + 1.5997×10⁻⁴/(38.9 − σ²)
 * where σ = 10000 / λ (μm⁻¹), λ in Ångströms.
 *
 * Accuracy: ~0.01 Å in the visible range (4000–7000 Å), sufficient for this app.
 *
 * elements.json stores vacuum wavelengths as canonical.
 * Call vacuumToAir() at render time when displaying air wavelengths.
 */

function refractiveIndex(lambdaVacAng: number): number {
  const sigma = 1e4 / lambdaVacAng  // μm⁻¹
  const s2 = sigma * sigma
  return 1 + 8.34213e-5 + 2.40603e-2 / (130 - s2) + 1.5997e-4 / (38.9 - s2)
}

/** Convert vacuum wavelength (Å) to standard air wavelength (Å). */
export function vacuumToAir(lambdaVac: number): number {
  return lambdaVac / refractiveIndex(lambdaVac)
}

/** Convert standard air wavelength (Å) to vacuum wavelength (Å). One Newton step. */
export function airToVacuum(lambdaAir: number): number {
  // First estimate uses air wavelength in the formula (off by ~0.01 Å); one iteration corrects it.
  const lambdaVac0 = lambdaAir * refractiveIndex(lambdaAir)
  return lambdaAir * refractiveIndex(lambdaVac0)
}
