import threading

from server import start_server
from main import Listener
from tkinter import *
from tkinter import ttk

def start_gui():
    root = Tk()
    frm = ttk.Frame(root, padding=10)
    frm.grid()

    listener = Listener()

    ttk.Label(frm, text="Start recording").grid(column=0, row=0)
    ttk.Button(frm, text="Start", command=listener.run_listener).grid(column=1, row=0)

    root.mainloop()

if __name__ == '__main__':
    server_thread = threading.Thread(target=start_server)
    gui_thread = threading.Thread(target=start_gui)
 
    server_thread.start()
    gui_thread.start()
 
    server_thread.join()
    gui_thread.join()
