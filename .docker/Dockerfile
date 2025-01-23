FROM ubuntu:noble

# Upgrade all packages
RUN apt-get update && apt-get upgrade -y

# Install Curl
RUN apt-get update && apt-get install -y curl unzip

# Swap Users from Root to Ubuntu
USER ubuntu
WORKDIR /home/ubuntu

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash

# Bun installs environment variables into .bashrc. This prevents docker from seeing them unless in --it (interactive) mode. We override this.
ENV BUN_INSTALL="/home/ubuntu/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"