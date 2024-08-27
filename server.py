from http.server import HTTPServer, BaseHTTPRequestHandler, SimpleHTTPRequestHandler
from os import getenv
import sys
import subprocess

port=int(getenv("PORT", 8080))

def run(server_class=HTTPServer, handler_class=BaseHTTPRequestHandler):
    server_address=('',port)
    httpd = server_class(server_address, handler_class)
    print("Listening on {0}".format(port))

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.server_close()
        print("Server stopped.")

class RequestHandler(SimpleHTTPRequestHandler):

    def do_GET(self):
        if self.path == "/recommended":
            args = ["python", "krr.py"] + sys.argv[1:] + ["-q", "-f", "json"]

            result = subprocess.run(args, capture_output=True)

            if result.returncode == 0:
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Cache-Control", "max-age=600")
                self.end_headers()
                self.wfile.write(result.stdout)
            else:
                self.send_response(500)
                self.end_headers()
                if (len(result.stderr)):
                    self.wfile.write(result.stderr)
                elif (len(result.stdout)):
                    self.wfile.write(result.stdout)
                else:
                    self.wfile.write("Error: return code {0}".format(result.returncode).encode())
        else:
            super().do_GET()

if __name__ == "__main__":
    run(handler_class=RequestHandler)