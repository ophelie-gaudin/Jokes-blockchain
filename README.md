# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

# Dad Jokes NFT Collection

Une application décentralisée pour créer et collectionner des blagues de papa sous forme de NFTs sur la blockchain Ethereum.

## Prérequis

- Node.js (v16+)
- npm
- Extension MetaMask

## Installation & Configuration

### 1. Installation du projet

##### Cloner le projet

git clone <https://github.com/ophelie-gaudin/Jokes-blockchain.git>

<<<<<<< HEAD
=======
cd Jokes-blockchain

>>>>>>> origin/kdev
##### Installer les dépendances

npm install

cd frontend

npm install

### 2. Configuration de la Blockchain

Ouvrir 2 terminaux.

#### Terminal 1 : Démarrer la blockchain locale

npx hardhat node

#### Terminal 2 : Déployer le contrat

- npx hardhat compile
- npx hardhat run scripts/deploy.ts --network localhost

⚠️ **Important** : Copiez l'adresse du contrat déployé, vous en aurez besoin. _(étape 4.1)_

### 3. Configuration de MetaMask

1. Ouvrir MetaMask
2. Ajouter le réseau Hardhat :

    - Nom : Hardhat
<<<<<<< HEAD
    - URL RPC : http://127.0.0.1:8545
    - Chain ID : 1337
=======
    - URL RPC : <http://127.0.0.1:8545>
    - Chain ID : 31337 (ou 1337) # map to the chainId in hardhat.config.ts
>>>>>>> origin/kdev
    - Symbole : ETH

3. Importer un compte test (prendre l'adresse d'un des wallet créé dans le terminal 1 où le node tourne) :

    - Copier une clé privée depuis le terminal hardhat
    - Dans MetaMask : Comptes -> Importer -> Coller la clé

### 4. Configuration du serveur ipfs

1. Démarrer le serveur ipfs : cd ipfs && docker-compose up -d
   adresse du serveur ipfs pour l'upload des fichiers : <http://localhost:5001/api/v0/add>
   adresse du serveur ipfs pour la récupération des fichiers : <http://localhost:8080/ipfs/{ipfsHash}>

### 5. Configuration du Frontend

1. Mettre à jour l'adresse du contrat et l'abi':

    ```typescript
    // frontend/src/config/contract.ts
    export const JOKE_NFT_ADDRESS = 'votre-adresse-de-contrat'
    ```

    ```typescript
    // frontend/src/config/contract.ts
    export const JOKE_NFT_ABI = 'votre-abi'
    ```

2. Démarrer l'application :

    ```bash
    cd frontend
    npm run dev
    ```

3. Ouvrir <http://localhost:5173>

## Utilisation

1. **Connecter son wallet**

    - Cliquer sur "Connect Wallet"
    - Sélectionner le compte Hardhat importé

2. **Créer une blague**

    - Remplir le contenu
    - Choisir le type
    - Définir la valeur
    - Cliquer sur "Mint Joke"

3. **Voir les blagues**

    - Toutes les blagues apparaissent dans le feed
    - Possibilité de voter pour les blagues

## Problèmes courants

1. **Si vous redémarrez le nœud Hardhat**

    - Redéployer le contrat
    - Mettre à jour l'adresse dans `contract.ts`
    - Réinitialiser le compte MetaMask

2. **Si les transactions échouent**

    - Vérifier que MetaMask est sur le réseau Hardhat
    - Réinitialiser le compte : Paramètres -> Avancé -> Réinitialiser

3. **Si les blagues ne s'affichent pas**

    - Vérifier la console pour les erreurs
    - Vérifier l'adresse du contrat
    - Rafraîchir la page

## Structure du projet
