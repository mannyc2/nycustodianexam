using Workerd = import "/workerd/workerd.capnp";

const config :Workerd.Config = (
  services = [ (name = "main", worker = .mainWorker) ],
  sockets = [ (name = "http", address = "127.0.0.1:8787", http = (), service = "main") ]
);

const mainWorker :Workerd.Worker = (
  modules = [ (name = "worker.js", esModule = embed "dist/worker.js") ],
  compatibilityDate = "2026-08-01",
  bindings = [ (name = "BUILD_ID", text = "r23-workerd-probe") ]
);
