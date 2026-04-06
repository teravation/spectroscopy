# Spectroscopy

An interactive educational puzzle for astronomical spectroscopy. Given a mystery spectrum, identify which chemical elements — and at what radial velocity — compose it.

**Live at [spectroscopy.app](https://spectroscopy.app)**

Originally deployed at the Denver Museum of Nature & Science and in college curricula. This is a full reboot of the [original 2003 Java applet](https://github.com/teravation/spectroscopy-legacy) as a modern React web app.

## What it teaches

- Each element has a unique spectral "fingerprint" of colored lines
- Stars and nebulae can be identified by their spectra
- Moving sources shift spectral lines toward red or blue (Doppler effect)

## For educators

Share a URL with preset difficulty or a pre-programmed puzzle:

```
# Random puzzle, easy difficulty
https://spectroscopy.app/?rows=2&doppler=false

# Pre-programmed puzzle (elements + velocity hidden from students)
https://spectroscopy.app/?puzzle=<encrypted-token>
```

See [PROJECT.md](PROJECT.md) for full architecture and feature documentation.

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

## License

MIT — spectral line data sourced from the [NIST Atomic Spectra Database](https://www.nist.gov/pml/atomic-spectra-database).
