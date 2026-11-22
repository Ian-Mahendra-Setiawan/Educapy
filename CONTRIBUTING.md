# Panduan Kontribusi EduCapy

Tim mengerjakan proyek per Work Package (WP) dengan alur **branch, pull request, merge**. Tidak ada yang push langsung ke `main`, kecuali commit awal repositori.

## Alur satu WP

1. Pembuat membuat branch dari `main` terbaru, mengerjakan WP, commit, lalu push branch.
2. Pembuat membuka Pull Request ke `main` dan menunjuk reviewer.
3. Reviewer (anggota lain) membaca perubahan, menyetujui, lalu me-merge dengan **merge commit** (bukan squash) agar riwayat WP terlihat di `main`.
4. Branch dihapus setelah merge.
5. WP berikutnya baru boleh dibuat setelah semua WP prasyaratnya ter-merge (aturan precedence).

## Nama branch

`<jenis>/wp-<id>-<persona>`. Contoh: `feat/wp-2.1.1-dante`, `docs/wp-5.2.1-artemis`.

| Jenis | Dipakai untuk |
|---|---|
| `feat` | Fitur kode |
| `docs` | Dokumen |
| `test` | Pengujian |
| `chore` | Konfigurasi dan persiapan |
| `fix` | Perbaikan bug |

## Pesan commit

`jenis(wp-<id>): ringkasan singkat - Persona`

Contoh: `feat(wp-3.2.1): pendaftaran les mandiri oleh siswa (backend) - Dante`

## Aturan review

- Pembuat tidak boleh me-merge pekerjaannya sendiri.
- Reviewer menjalankan `npm test` bila WP menyentuh kode.
- Temuan kecil diperbaiki di branch yang sama (commit tambahan), bukan di branch baru.
- Perbaikan bug setelah merge memakai branch `fix/wp-<id>-<persona>`.

## Rilis

Setelah WP 5.2.3 ter-merge, tag `v1.0.0` dibuat dari `main` sebagai versi serah terima.

## Pengaturan GitHub yang disarankan

Settings > General: aktifkan **Automatically delete head branches**. Jika akun Anda mendukung branch protection (repo publik, atau paket Team/Pro), aktifkan **Require a pull request before merging** untuk `main`.
