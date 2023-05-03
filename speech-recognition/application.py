import threading
import customtkinter
import os

from ws_server import start_server
from main import Listener
from tkinter import *
from PIL import Image

class UiManager:
    def __init__(self, root, listener):
        self.root = root
        self.listener = listener

    def destroy(self):
        self.root.destroy()
        self.listener.destroy()

def start_gui():
    listener = Listener()

    file_path = os.path.dirname(os.path.realpath(__file__))
    image_start = customtkinter.CTkImage(Image.open(file_path + "/start.png"), size = (35, 35))
    image_stop = customtkinter.CTkImage(Image.open(file_path + "/stop.png"), size = (35, 35))

    app = customtkinter.CTk()
    app.geometry("400x300")
    uiManager = UiManager(app, listener)


    frame = customtkinter.CTkFrame(master=app, corner_radius=20)
    frame.pack(pady=20, padx=20, fill="both", expand=True)

    button_start = customtkinter.CTkButton(master=frame,
                                        image = image_start,
                                        text = "Start record",
                                        corner_radius = 8,
                                        width = 200,
                                        height = 30,
                                        font = ("Arial",20),
                                        text_color="black",
                                        border_spacing = 10,
                                        command=listener.run_threaded_listener)
    button_start.pack(padx=20, pady=20)

    button_stop = customtkinter.CTkButton(master = frame,
                                        image = image_stop,
                                        text = "Stop record",
                                        corner_radius = 8,
                                        width = 200,
                                        height = 30,
                                        font = ("Arial",20),
                                        text_color="black",
                                        border_spacing = 10,
                                        command=listener.stop_listener)
    button_stop.pack(padx=20, pady=20)

    app.protocol('WM_DELETE_WINDOW', uiManager.destroy)
    app.mainloop()

if __name__ == '__main__':
    server_thread = threading.Thread(target=start_server)
    gui_thread = threading.Thread(target=start_gui)
 
    server_thread.start()
    gui_thread.start()
 
    gui_thread.join()
    server_thread.join()

    quit()
