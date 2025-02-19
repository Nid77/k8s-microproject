## Steps

### Part 1

#### Step 1 - Initial project setup

1. Clone this repository

```bash
git clone git@github.com:nas-tabchiche/k8s-microproject.git
```

2. Create your own repository on Github

3. Change the repote to your repository

```bash
git remote set-url origin git@github.com:<github-username>/<repo-name>.git
```

#### Step 2 - Install and run the application

Requirements:
- Node 22+
- npm
- cURL

1. Install dependencies

```bash
npm install
```

2. Run the application

```
node app.js
```

3. Send a GET request to the exposed endpoint

```bash
curl http://localhost:3000/
```

The output should be 'Hello, Kubernetes!'

#### Step 3 - Dockerize and publish the image

1. Write a Dockerfile

2. Build your image with the `k8s-microproject` tag

```bash
docker build . -t <username>/k8s-microproject
```

3. Publish the image on dockerhub

```bash
docker push <username>/k8s-microproject
```

#### Step 4 - Create and expose your first deployment

1. Write a `deployment.yaml` file describing your deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: k8s-microproject-deployment
spec:
  ...
```

2. Write a `service.yaml`file describing your service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: k8s-microproject-service
spec:
```

3. Apply your deployment and service

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

4. Check that your pods are running

```bash
kubectl get pods
```

> [!NOTE]
> Their status should be 'Running'. It might take a few seconds to get there.

5. Expose your application

```bash
# If you use minikube
minikube service k8s-microproject-service --url
```

6. Send a GET request to the exposed endpoint

```bash
curl <URL of the exposed service>
```

The output should be 'Hello, Kubernetes!'

#### Step 5 - Create an ingress

> [!WARNING]
>  Open a new terminal with command "minikube tunnel"

1. Write a `ingress.yaml` file describing your ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: k8s-microproject-ingress
spec:
  ...
```

2. Apply your ingress

```bash
kubectl apply -f ingress.yaml
```

3. Check that your ingress is operational

```bash
kubectl get ingress
```

4. Send a GET request to the ingress

```bash
curl --resolve "<ingress-host>:80:<ingress-address>" -i http://<ingress-host>/
```

### Part 2

#### Liveness probe

> Docs: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-a-liveness-http-request

Define a liveness HTTP request
```bash
livenessProbe: 
  httpGet:
    path: /healthz
    port: 3000
    httpHeaders:
      - name: Custom-Header
        value: Awesome
  initialDelaySeconds: 3
  periodSeconds: 3
```

See health check in Event
```
kubectl describe pod <pod-name>
```

#### HTTPS support
Generate the tls.key and tls.crt
```
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt -subj "/CN=k8s-microproject.rayan"
```

Create kubernetes Secret
```
kubectl create secret tls secret-tls --cert=tls.crt --key=tls.key
```

Use ingress for https
```
kubectl apply -f ingress_https.yaml
```

> [!WARNING]
>  Don't forget to enable ingress addons
```
minikube addons enable ingress
```

Test connection with HTTPS without certifacte validation
```
curl -k -i https://127.0.0.1 -H "Host: k8s-microproject.rayan"
```

#### Persistence

Use deployment for persistence
```
kubectl apply -f deployment_pv.yaml
```

PersistenceVolume
```
kubectl apply -f pv.yaml
```
PersistenceVolumeClaim
```
kubectl apply -f pvc.yaml
```
See PV and PVC 
```
kubectl get pv,pvc
```


Testing persistence :

Create a log with request
```
curl http://127.0.0.1 -H "Host: k8s-microproject.rayan"
kubectl exec -it <pod-name> -- ls /data
```
Delete pod and see data is always present
```
kubectl delete pod <pod-name>
kubectl get pods
kubectl exec -it <pod-name> -- ls /data
```

#### ConfigMaps

Define ConfigMap
```
apiVersion: v1
kind: ConfigMap
metadata:
  name: configmap-k8s-microproject
data:
  user_name: "nid77"
```

Define the environment variable in "deployment.yaml"
```
spec:
  containers:
    ...
    env:
      - name: USER_NAME
        valueFrom:
          configMapKeyRef:
            name: configmap-k8s-microproject
            key: user_name
    ...
```
Apply config map
```
kubectl apply -f configmap.yaml
```
Restart deployment 
```
kubectl rollout restart deployment
```
Test envrionment variable
```
curl -i https://127.0.0.1 -H "Host: k8s-microproject.rayan"
kubectl exec -it <pod-name> -- cat /data/out-<pod-name>.log
```
The output should be 
```
Hello, nid77!
```

#### StatefulSets
Deploy application using StatefulSets

```
kubectl apply -f statefulset.yaml
```

There should be pods ordered from 0 to n-1 replicas.
```
kubectl get pods
```
The output should look like :
```
NAME                                           READY   STATUS    RESTARTS   AGE
..................................
statefulset-k8s-microproject-0                 1/1     Running   0          21m
statefulset-k8s-microproject-1                 1/1     Running   0          21m
...................................
```

Test stateful service
```
kubectl apply -f service_statefulset.yaml

curl -H "Host: statefulset-k8s-microproject.rayan" http://127.0.0.1
```

Each pod have their own PV
```
kubectl get pv,pvc
```
