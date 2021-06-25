# Kube Count Resource

A CLI to simplify counting requests and limits used by a List of Kubernetes
deployments.

## Requirements

* Node.js v12+

## Usage

The following examples use `npx`, but you can also install this as a global
CLI via `npm install -g kcr` and drop `npx`.

### Pipe

```bash
kubectl get deployments -o json | npx kcr

Requests: 0.500 Cores / 1.000 Gi
Limits:   0.700 Cores / 1.500 Gii
```

OpenShift is also supported, so you can pass Deployments and DeploymentConfigs.

```bash
oc get dc,deployments -o json --all-namespaces | npx kcr

Requests: 0.500 Cores / 1.000 Gi
Limits:   0.700 Cores / 1.500 Gii
```

### File List

```bash
kubectl get deployments -o json > deployments.json

npx kcr deployments.json

Requests: 0.500 Cores / 1.000 Gi
Limits:   0.700 Cores / 1.500 Gii
```
