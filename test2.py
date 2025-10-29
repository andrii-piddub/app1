#!/usr/bin/env python3
# masked_pin_generator.py
# Генерує рандомний числовий пароль (за замовчуванням 6 цифр),
# показує в полі тільки '*', дає можливість скопіювати пароль у буфер,
# і очищає буфер через 20 секунд.

import tkinter as tk
from tkinter import ttk, messagebox
import secrets

CLIP_CLEAR_MS = 20_000  # 20 seconds

def generate_password(length=6):
    return ''.join(secrets.choice('0123456789') for _ in range(length))

def on_generate():
    pwd = generate_password(length_var.get())
    app_state['password'] = pwd
    entry_var.set('*' * len(pwd))
    status_var.set(f"Generated {len(pwd)}-digit password (masked).")
    copy_btn.state(['!disabled'])

def copy_to_clipboard():
    pwd = app_state.get('password')
    if not pwd:
        messagebox.showwarning("No password", "No password generated yet.")
        return
    root.clipboard_clear()
    root.clipboard_append(pwd)
    status_var.set("Password copied to clipboard — will be cleared in 20s.")
    copy_btn.state(['disabled'])
    root.after(CLIP_CLEAR_MS, clear_clipboard)

def clear_clipboard():
    try:
        current = root.clipboard_get()
        if current == app_state.get('password'):
            root.clipboard_clear()
    except Exception:
        pass
    app_state['password'] = ''
    entry_var.set('')
    status_var.set("Clipboard cleared. Password removed from memory.")
    copy_btn.state(['disabled'])

def on_copy_shortcut(event=None):
    copy_to_clipboard()

def on_quit():
    try:
        current = root.clipboard_get()
        if current == app_state.get('password'):
            root.clipboard_clear()
    except Exception:
        pass
    root.destroy()

# --- GUI ---
root = tk.Tk()
root.title("Masked numeric password generator")

main = ttk.Frame(root, padding=12)
main.grid(row=0, column=0, sticky="NSEW")

root.columnconfigure(0, weight=1)
root.rowconfigure(0, weight=1)
main.columnconfigure(1, weight=1)

ttk.Label(main, text="Generated password (masked):").grid(row=0, column=0, columnspan=2, sticky="W")

entry_var = tk.StringVar(value="")
entry = ttk.Entry(main, textvariable=entry_var, show="*", font=("TkDefaultFont", 14))
entry.grid(row=1, column=0, columnspan=2, sticky="EW", pady=(4,8))
entry.configure(state='readonly')

ttk.Label(main, text="Digits:").grid(row=2, column=0, sticky="W")
length_var = tk.IntVar(value=6)
length_spin = ttk.Spinbox(main, from_=4, to=12, textvariable=length_var, width=5)
length_spin.grid(row=2, column=1, sticky="E")

generate_btn = ttk.Button(main, text="Generate", command=on_generate)
generate_btn.grid(row=3, column=0, sticky="EW", pady=(8,4))

copy_btn = ttk.Button(main, text="Copy to clipboard", command=copy_to_clipboard)
copy_btn.grid(row=3, column=1, sticky="EW", pady=(8,4))
copy_btn.state(['disabled'])

status_var = tk.StringVar(value="Press Generate to create a masked 6-digit password.")
status_lbl = ttk.Label(main, textvariable=status_var, wraplength=380)
status_lbl.grid(row=4, column=0, columnspan=2, sticky="W", pady=(6,0))

app_state = {'password': ''}

root.bind_all('<Control-c>', on_copy_shortcut)
root.protocol("WM_DELETE_WINDOW", on_quit)

root.mainloop()
