# krr-web

Super simple React front-end for krr. Start the server in a docker container
with the same args you would start regular krr with.
Just replace `krr.py` with `server.py`.

```bash
docker run -it --rm \
    -p 8080:8080 \
    -v ~/.kube/config:/root/.kube/config \
    krr-web \
    python server.py simple \
        --mem-min 10 --cpu-min 5 \
        --memory-buffer-percentage 25 \
        --oom-memory-buffer-percentage 50
```