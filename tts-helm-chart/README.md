# TTS Helm Chart

This chart deploys:

- Frontend Deployment using `dheerajkadve/tts-frontend:latest`
- Frontend NodePort Service on port `80`
- Backend Deployment using `dheerajkadve/tts-backend:latest`
- Backend NodePort Service named `backend` on port `5000`
- Namespace `tts`, created by the Helm install command

## Install

From the directory containing `tts-helm-chart`:

If the original YAML resources are currently deployed, remove only those four
resources before the first Helm installation:

```bash
kubectl delete deployment frontend-deployment backend-deployment -n tts
kubectl delete service frontend-service backend -n tts
```

Now install the chart:

```bash
helm upgrade --install tts-app ./tts-helm-chart \
  --namespace tts \
  --create-namespace
```

## Check the application

```bash
helm list -n tts
kubectl get all -n tts
```

## Access the frontend

For a local kind cluster, port-forwarding is the simplest option:

```bash
kubectl port-forward -n tts svc/frontend-service 8080:80
```

Open `http://localhost:8080` in the browser. Keep the port-forward command running.

## Upgrade after changing values

```bash
helm upgrade tts-app ./tts-helm-chart -n tts
```

Example: set fixed NodePorts:

```bash
helm upgrade --install tts-app ./tts-helm-chart \
  --namespace tts \
  --create-namespace \
  --set frontend.service.nodePort=30712 \
  --set backend.service.nodePort=32270
```

## Uninstall

```bash
helm uninstall tts-app -n tts
kubectl delete namespace tts
```

## Important frontend/backend networking note

The hostname `backend` works only from another pod inside Kubernetes. Browser JavaScript runs on your Windows machine, not inside the frontend pod, so it cannot normally fetch `http://backend:5000`.

If the frontend makes the API request directly from the browser, configure it to use a browser-reachable backend URL, or proxy `/api` from the frontend web server to `http://backend:5000`.
