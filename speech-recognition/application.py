import threading

from ws_server import start_server
from main import Listener
from tkinter import *
from tkinter import ttk

class UiManager:
    def __init__(self, root, listener):
        self.root = root
        self.listener = listener

    def destroy(self):
        self.root.destroy()
        self.listener.destroy()

def start_gui():
    root = Tk()
    frm = ttk.Frame(root, padding=10)
    frm.grid()

    listener = Listener()
    uiManager = UiManager(root, listener)

    ttk.Label(frm, text="Start recording").grid(column=0, row=0)
    ttk.Button(frm, text="Start", command=listener.run_threaded_listener).grid(column=1, row=0)

    ttk.Label(frm, text="Stop recording").grid(column=0, row=1)
    ttk.Button(frm, text="Stop", command=listener.stop_listener).grid(column=1, row=1)

    root.protocol('WM_DELETE_WINDOW', uiManager.destroy)
    root.mainloop()

if __name__ == '__main__':
    server_thread = threading.Thread(target=start_server)
    gui_thread = threading.Thread(target=start_gui)
 
    server_thread.start()
    gui_thread.start()
 
    gui_thread.join()
    server_thread.join()

    quit()
