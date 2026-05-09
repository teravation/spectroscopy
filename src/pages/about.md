# About Spectroscopy

## What Is Spectroscopy?

When atoms are excited — by heat, electricity, or the intense pressure inside a star — they release energy as light. But not just any light: each element emits a precise, characteristic set of wavelengths, like a fingerprint unique to that element. Hydrogen always produces the same pattern. So does helium. So does iron.

This is the foundation of spectroscopy: by spreading starlight through a prism or diffraction grating, astronomers can read those fingerprints and determine exactly what a distant star is made of — without ever leaving Earth.

### The Doppler Effect

If a star is moving toward us, its light waves are compressed slightly, shifting every line toward the blue end of the spectrum. If it's moving away, the waves stretch and shift toward red. The size of this shift is directly proportional to the star's velocity — measure the shift, calculate the speed. This is how we know that galaxies are receding from us, how we measure the rotation of the Milky Way, and how astronomers first confirmed planets around other stars: a planet's gravity causes its host star to wobble, shifting the star's spectral lines in a repeating pattern that betrays the planet's presence. (The 2019 Nobel Prize in Physics was awarded for exactly this discovery.)

### What Stars Are Made Of — and When They Formed

Stars generate energy by fusing hydrogen into helium in their cores. As a star ages, its hydrogen is gradually consumed and the proportion of helium increases. But spectroscopy reveals something deeper than just hydrogen and helium: the heavier elements — carbon, oxygen, iron, calcium — couldn't have existed at the Big Bang. They were forged in the cores of earlier generations of stars and scattered across space when those stars exploded as supernovae.

A star rich in these heavy elements formed from gas already enriched by multiple previous stellar generations — a relative newcomer on the cosmic timescale. A star with almost no metals may be among the universe's oldest, formed when only hydrogen and helium existed. Every stellar spectrum is a small piece of the universe's autobiography.

### Emission and Absorption

Stars produce two complementary types of spectra. In **emission** mode, excited atoms radiate at specific wavelengths — you see bright colored lines against a dark background. In **absorption** mode, a continuous rainbow of light passes through a cooler gas layer; the same elements absorb the same wavelengths they would emit, leaving dark lines cut into the spectrum. Both modes reveal the same fingerprints. This app lets you explore both.

### How Our Spectra Are Generated

The line intensities in this app are drawn from the [NIST Atomic Spectra Database](https://physics.nist.gov/PhysRefData/ASD/lines_form.html) and normalized using Einstein A coefficients (Aki) — a measure of how readily each transition occurs, expressed in photons per excited atom per second. Unlike the relative intensities published by NIST (which are meaningful only within a single element's spectrum), Aki values are physically comparable across elements. This means Iron, which has an extraordinarily high emission rate across hundreds of visible transitions, genuinely appears more complex and overwhelming than Hydrogen — because in a real stellar atmosphere, it is.

This is why our spectra may look slightly different from photographs of discharge tubes or per-element reference charts: those show each element in isolation, optimized for its own brightness. Ours show how elements would appear simultaneously in the same stellar plasma, which is the actual challenge astronomers face.

---

## How to Play

Select **▶ New Target** to generate a mystery spectrum. Your goal is to identify the elements that produce it by selecting them from the periodic table — your working spectrum updates in real time as you add elements. Use the Doppler slider to match any velocity shift. When your working spectrum matches the target, tap **✓ Check Answer**.

Use **💡 Hint** if you're stuck — it tells you how many elements you have correct and whether your velocity is too high or too low.

---

## The Story of This App

Spectroscopy began as a Java applet in 2003, built by [Teravation](http://teravation.com) as an educational tool for teaching astronomical spectroscopy. It was designed to make a genuinely difficult concept — how astronomers identify the composition of stars they can never visit — tangible and interactive.

### Denver Museum of Nature and Science

The app found its first major audience at the Denver Museum of Nature and Science, where it was deployed as part of the **Space Odyssey** exhibit. Thousands of visitors used it to experience, firsthand, the challenge of reading a stellar spectrum — the same puzzle professional astronomers solve daily.

### College and University Curricula

Beyond the museum, the app was adopted into the AS100 course at Millikin University, distributed through Apprentissage électronique Ontario (e-Learning Ontario), and used in secondary schools across Europe and South America.

### This Reboot

The original applet stopped running in modern browsers as Java plugins were phased out. In 2025, Teravation rebuilt it from the ground up as a modern web application — preserving the original physics and gameplay while making it accessible on any device, from a museum kiosk to a phone in a student's hand.

The spectral data was re-fetched directly from NIST using Einstein A coefficients, correcting a known issue in the original dataset--Iron (Fe) was accidentally mislabeled as Francium (Fr) and had no spectral lines. The source code is [open on GitHub](https://github.com/teravation/spectroscopy).

---

## Credits and Licenses

**Spectral data** is sourced from the [NIST Atomic Spectra Database](https://physics.nist.gov/PhysRefData/ASD/lines_form.html), a publication of the United States National Institute of Standards and Technology. NIST data is in the public domain.

This application is open-source software released under the [MIT License](https://github.com/teravation/spectroscopy/blob/main/LICENSE). It is built with React, Zustand, TanStack Query, and Vite, among other open-source libraries. See [Third-Party Licenses](/licenses) for full attribution.
