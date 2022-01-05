# albeksexample

## Note!!!
Before you run deploy, please install helm in your computer and run

- `helm repo add eks https://aws.github.io/eks-charts`
- `helm repo`

Example repo for use `cdk8s-aws-load-balancer-controller` with eks stack.


### after create the eks cluster you can apply 2048 to test it 
```bash
kubectl apply -f 2048/

kubectl get pod,deploy,ing -n 2048-game
```
