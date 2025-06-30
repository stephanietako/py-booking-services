import React from "react";
import Wrapper from "../components/Wrapper/Wrapper";

const page = () => (
  <Wrapper>
    <section
      style={{
        display: "flex",
        justifyContent: "center",
        background: "#f9fafb",
        minHeight: "100vh",
        padding: "2rem 0",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
          maxWidth: 900,
          width: "100%",
          padding: "2.5rem 2rem",
          color: "#1e293b",
          fontSize: "1.05rem",
          lineHeight: 1.7,
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>
          Conditions Générales d’Utilisation (CGU)
        </h2>

        <h3>Définitions</h3>
        <ul>
          <li>
            <b>Annonce</b> : désigne une offre de Location publiée par Yachting
            Day sur le Site.
          </li>
          <li>
            <b>Bateau</b> : Bateau de plaisance offert à la Location sur le
            Site.
          </li>
          <li>
            <b>Chef de bord</b> : personne autorisée à utiliser le bateau loué
            et à embarquer toute personne sur le bateau sous sa responsabilité
            et/ou sous la responsabilité jointe du locataire. Il garantit la
            sécurité des plaisanciers lors de la navigation.
          </li>
          <li>
            <b>CGU</b> : désigne les présentes conditions générales
            d’utilisation.
          </li>
          <li>
            <b>Contenu</b> : tout(e) texte, graphique, image, vidéo, information
            ou autres éléments que les Utilisateurs postent, téléchargent,
            publient, soumettent, transmettent, ou incluent dans leur Annonce ou
            compte Utilisateur afin de le rendre disponible sur le Site.
          </li>
          <li>
            <b>Contrat de location</b> : contrat à titre onéreux par lequel un
            propriétaire met à disposition son bateau pour un temps et un prix
            déterminé. Il fixe les termes de la location convenue entre les
            parties.
          </li>
          <li>
            <b>Etat des lieux d&apos;entrée</b> : document décrivant l&apos;état
            du bateau au moment de la Prise en main, à réaliser entre le
            Locataire et le Propriétaire (ou son représentant) ou Yachting Day
            au moment de la prise en main du bateau. Il doit être le plus
            complet possible, avec photographies et commentaires à l&apos;appui,
            et signé par les deux parties avant le départ du Bateau, sur le
            contrat fourni par le Propriétaire ou Yachting Day.
          </li>
          <li>
            <b>Etat des lieux de sortie</b> : document décrivant l&apos;état du
            bateau à la fin de la Location, et doit être complété d&apos;un
            constat de dommage en cas de sinistre. Il doit être le plus précis
            possible.
          </li>
          <li>
            <b>Locataire</b> : toute personne physique ou morale réservant un
            Bateau pour sa Location.
          </li>
          <li>
            <b>Location</b> : location d’un Bateau par Yachting Day à un
            Locataire, à quai ou en mer.
          </li>
          <li>
            <b>Options</b> : options pouvant être souscrites par le Locataire en
            sus du Prix de la location (hôtesse, capitaine, paddle board...).
          </li>
          <li>
            <b>Prise en main</b> : prise en main du Bateau ou l’arrivée sur le
            Bateau le premier jour de la Location, les temps de nettoyage, mise
            à niveau de carburant et l&apos;Etat des lieux d’entrée et de sortie
            font partie intégrante de la période de location prévue au contrat.
          </li>
          <li>
            <b>Prix Locataire</b> : prix affiché sur l’Annonce à l’exclusion des
            Options supplémentaires. Sauf accord préalable avec Yachting Day
            et/ou le Propriétaire, le Prix Locataire n’inclut ni la place du
            Bateau dans le port, ni le montant du carburant.
          </li>
          <li>
            <b>Propriétaire</b> : toute personne physique ou morale, pouvant
            justifier de la pleine propriété d’un Bateau à première demande de
            Yachting Day et/ou d’un Locataire. Par extension, désigne également
            le mandataire d’un Propriétaire, ce mandataire devant justifier de
            l’existence et de la portée du mandat qu’il a reçu.
          </li>
          <li>
            <b>Service</b> : ensemble des services proposés par Yachting Day en
            tant que propriétaire du Bateau, incluant la mise à disposition du
            Bateau à la location, la gestion des réservations, des paiements et
            l’accompagnement du Locataire avant, pendant et après la location.
          </li>
          <li>
            <b>Site</b> : site internet www.yachting-day.com.
          </li>
          <li>
            <b>Utilisateur</b> : tout utilisateur du Site et du Service.
          </li>
        </ul>

        <h3>Acceptation des CGU</h3>
        <p>
          L’utilisation du Service et du Site sont soumis aux présentes CGU. Les
          CGU constituent un contrat régissant les relations entre l’Utilisateur
          et Yachting Day. Elles annulent et remplacent toutes les dispositions
          antérieures et constituent l&apos;intégralité des droits et
          obligations de Yachting Day et de l’Utilisateur relatifs à leur objet.
          Les Parties acceptent qu’en cas de contradiction entre des
          informations présentes sur le Site et les CGU, ces dernières
          prévalent.
        </p>
        <p>
          L’acceptation pleine et entière, sans réserve, par l’Utilisateur, des
          présentes CGU est réputée donnée dès lors que celui-ci a coché la case
          « j’accepte les conditions générales » lors de la création de son
          compte Utilisateur ou de la souscription d’une offre. À défaut d’avoir
          coché cette case, la création du compte de l’Utilisateur et son
          utilisation du Service est impossible et non valable, ce que
          l’Utilisateur reconnaît.
        </p>
        <p>
          Yachting Day se réserve le droit de modifier à tout instant, les
          modifications prenant le cas échéant effet au moment de leur
          publication sur le Site. La continuation de l’utilisation du Site vaut
          acceptation tacite des Utilisateurs de la dernière version mise à jour
          des CGU.
        </p>

        <h3>Objet du Service</h3>
        <p>
          Le Service est un service de mise en relation entre Yachting Day,
          Propriétaires et Locataires pour faciliter la Location d’un Bateau
          ainsi que la gestion des paiements entre le Locataire et le
          Propriétaire. À ce titre, Yachting Day ne saurait être tenu d’exécuter
          les obligations d’un Utilisateur en ses lieu et place et ne saurait
          voir sa responsabilité engagée au titre des manquements par un
          Utilisateur à ses obligations contractuelles. Chaque utilisateur
          s’engage à respecter les modalités et conditions présentes dans ledit
          contrat émis par Yachting Day.
        </p>

        <h3>Droit de rétractation</h3>
        <p>
          En acceptant les présentes CGU, l’Utilisateur est informé et reconnait
          que le Service, pleinement exécuté avant la fin du délai de
          rétractation de 14 jours prévu par l’article L. 221-18 du Code de la
          consommation, ne permet pas de bénéficier de ce droit de rétractation,
          conformément à l’article L. 221-28 du Code de la consommation. En
          acceptant d’utiliser le Service, l’Utilisateur renonce donc
          expressément au droit de rétractation prévu par l’article L.221-18 du
          Code de la consommation.
        </p>

        <h3>Accès au Service</h3>
        <ul>
          <li>
            Les Utilisateurs de la plateforme Yachting Day s’engagent à fournir
            des informations exactes.
          </li>
          <li>
            Yachting Day décline toute responsabilité dans la confirmation de
            l’identité et des informations communiquées par les Utilisateurs.
          </li>
          <li>
            Yachting Day peut demander aux Utilisateurs de fournir une pièce
            d’identité officielle ou autres informations, ou de se soumettre à
            d’autres contrôles destinés à vérifier l’identité et les antécédents
            des Utilisateurs.
          </li>
        </ul>

        <h3>Capacité juridique</h3>
        <ul>
          <li>
            Le Service est réservé aux personnes physiques majeures, aux mineurs
            émancipés, bénéficiant de leur pleine capacité juridique et aux
            personnes morales pouvant se soumettre sans réserve aux présentes
            CGU.
          </li>
        </ul>

        <h3>Utilisation du Service</h3>
        <h4>Création d’un compte Utilisateur</h4>
        <p>
          L’Utilisateur peut effectuer une réservation sans avoir à créer de
          compte. Toutefois, il a la possibilité de créer un compte Utilisateur
          s’il le souhaite, en suivant la procédure figurant sur le Site.
          L’Utilisateur est alors seul responsable de la conservation de la
          confidentialité de ses codes d’accès à sa boîte de messagerie
          électronique et à son compte Utilisateur, Yachting Day déclinant toute
          responsabilité en cas d’utilisation du Service par une personne autre
          que l’Utilisateur ou une personne autorisée par lui disposant de ses
          identifiants et mots de passe.
        </p>
        <p>
          En cas d’oubli ou d’utilisation non conforme par un tiers de ses
          identifiants, l’Utilisateur s’engage à en informer Yachting Day dans
          les meilleurs délais en utilisant le mail suivant
          yachtingday@gmail.com. L’Utilisateur s’engage à mettre à jour ses
          coordonnées sur le Site en cas de modification de son adresse email
          et/ou de son numéro de téléphone mobile.
        </p>

        <h4>Assurance</h4>
        <p>
          Le Propriétaire s’engage à ne proposer à la réservation que des
          Bateaux couverts par une assurance pour leurs activités de Location
          quelle que soit la nationalité de l’Utilisateur, la zone de navigation
          prévue et/ou le port d’attache habituel du Bateau. Le Propriétaire
          s’engage ainsi à informer son assurance plaisance annuelle de son
          activité de Location.
        </p>

        <h4>Demande de réservation du Locataire</h4>
        <p>
          Pour réserver, le Locataire choisit sur le Site un Bateau appartenant
          à Yachting Day, indique la date de début et de fin de la location, et
          peut sélectionner, si besoin, une ou plusieurs options supplémentaires
          proposées dans l’annonce. Cette sélection constitue une demande de
          réservation. En validant sa demande, le Locataire s’engage à : (i)
          payer à l’avance le montant total de la location (voir article 8), et
          (ii) autoriser Yachting Day à prélever sur son compte bancaire le
          montant du dépôt de garantie, selon les modalités prévues à l’article
          5.6.
        </p>

        <h4>Réservation du Bateau</h4>
        <p>
          Le montant du Prix Locataire est conservé jusqu’au paiement effectif
          ou au remboursement suivant les conditions d’annulations en accord
          avec l’article 7. Au jour de la Prise en Main, Yachting Day et/ou le
          Propriétaire et le Locataire s’engagent à effectuer un Etat des lieux
          d’entrée contradictoire et à signer entre eux un Contrat de Location.
          Le jour de la fin de la Location, Yachting Day et le Locataire
          s’engagent à effectuer un Etat des lieux de sortie contradictoire.
        </p>

        <h4>Dépôt de garantie</h4>
        <p>
          Yachting Day peut exiger un dépôt de garantie en contrepartie de la
          Location du Bateau. Le montant de ce dépôt est défini dans l’Annonce.
          Le Locataire s’engage à disposer d’une provision suffisante sur son
          compte bancaire pour le prélèvement du dépôt de garantie au moment de
          la signature du Contrat de location, et à maintenir une provision
          suffisante sur ledit compte jusqu’à la clôture du dossier de sinistre
          par Yachting Day.
        </p>

        <h3>Obligations des parties</h3>
        <h4>Obligations de l’Utilisateur</h4>
        <ul>
          <li>
            Utiliser le Site et le Service conformément aux présentes CGU et aux
            lois en vigueur
          </li>
          <li>
            Fournir des informations véridiques, licites, objectives et
            respectant les lois en vigueur
          </li>
          <li>
            Agir de bonne foi dans le cadre de l’utilisation du Service et du
            Site
          </li>
          <li>
            Ne disposer que d’un seul compte Utilisateur et à ne pas ouvrir de
            compte Utilisateur pour une autre personne que lui-même
          </li>
          <li>
            Actualiser régulièrement ses informations en se connectant à son
            compte Utilisateur
          </li>
          <li>
            Ne pas céder son compte Utilisateur à un tiers ni à un autre
            Utilisateur
          </li>
          <li>
            Garder confidentiel ses codes d’accès à son compte Utilisateur
          </li>
          <li>
            Respecter les formalités administratives et sanitaires en vigueur
          </li>
          <li>
            Rédiger et signer le jour de la Prise en Main un Contrat de Location
            comprenant un Etat des lieux d’entrée contradictoire
          </li>
          <li>
            Signer à la date de fin de Location ou à la date de restitution du
            Bateau en cas de retard, un Etat des lieux de sortie contradictoire
            du Bateau
          </li>
        </ul>

        <h4>Obligations spécifiques du Propriétaire</h4>
        <ul>
          <li>
            Pouvoir justifier à tout moment de sa qualité de Propriétaire du
            Bateau
          </li>
          <li>
            Avoir le cas échéant régulièrement déclaré et/ou immatriculé son
            Bateau auprès des administrations compétentes
          </li>
          <li>
            Informer le Locataire dans le Contrat de Location, de toute
            limitation de responsabilité de son assureur
          </li>
        </ul>

        <h4>Obligations spécifiques du Locataire</h4>
        <ul>
          <li>
            Être responsable du Bateau en sa qualité de Chef de bord dès la
            prise de possession du Bateau et jusqu’à sa parfaite restitution
          </li>
          <li>
            Détenir sur son compte bancaire le montant du dépôt de garantie, le
            cas échéant, à compter de l’Offre de réservation et jusqu’à 24
            heures suivant la date de fin de la Location
          </li>
          <li>
            Être propriétaire de la carte bancaire utilisée pour la réservation
            du Bateau
          </li>
          <li>
            Vérifier avant la signature du Contrat de Location, l’état du
            Bateau, la validité des éventuels contrôles techniques, la présence
            à bord d’un armement de sécurité conforme à la catégorie de
            navigation du Bateau et d’équipements à jour
          </li>
          <li>
            Régler toute contravention effectuée par lui pendant la durée de la
            Location, à première demande du Propriétaire ou de Yachting Day
          </li>
          <li>
            Être titulaire des diplômes, permis et/ou qualifications
            correspondants au Bateau et au plan de navigation
          </li>
          <li>
            Se présenter à l&apos;heure prévue lors de la réservation afin de
            rencontrer le Propriétaire (ou son représentant), ou un responsable
            de la société Yachting Day
          </li>
          <li>
            Signer le Contrat de Location et l’état des lieux d’entrées avant le
            départ du quai
          </li>
          <li>
            N’embarquer à bord que le nombre de personnes correspondant à
            l’armement de sécurité et à la catégorie de navigation du bateau,
            skipper compris
          </li>
          <li>
            Utiliser le bateau en « bon père de famille » pour une navigation de
            plaisance, dans le cadre de la législation maritime et douanière en
            vigueur, à l’exclusion de toute opération de commerce, pêche
            professionnelle, transport, remorquage ou autre
          </li>
          <li>
            Ne pas être dans l’incapacité médicale à naviguer/manœuvrer le
            bateau
          </li>
          <li>
            Ne pas être dans un état d’altérations temporaires de ses capacités
            due à la consommation d’alcool ou de substances
          </li>
          <li>
            Restituer le bateau à Yachting Day avec tout son équipement dans les
            mêmes conditions qu’au départ de la location, dans un état correct
            de propreté, et dans les délais prévus
          </li>
          <li>
            Restituer le bateau avec le même niveau de carburant que lors de sa
            prise en main, sauf mention contraire écrite lors de la réservation
            avec Yachting Day ou le Propriétaire
          </li>
          <li>
            Restituer le bateau à son port de départ, sauf accord contraire
            écrit du Propriétaire ou de Yachting Day
          </li>
        </ul>

        <h3>Annulation de la réservation</h3>
        <p>
          Toute annulation doit faire l’objet d’une information écrite préalable
          auprès de Yachting Day par les Utilisateurs via le mail suivant :
          yachtingday@gmail.com et la procédure d’annulation décrite dans les
          présentes CGU. Une annulation ne devient effective qu’après envoi par
          Yachting Day d’un courriel notifiant ladite annulation.
        </p>
        <p>
          Toute modification d’une réservation sollicitée par un Locataire après
          règlement de la Réservation est subordonnée à l’accord de Yachting
          Day. Toute fin de location anticipée, ne pourra donner droit à un
          quelconque remboursement.
        </p>

        <h3>Conditions de règlement de la Location</h3>
        <p>
          Le paiement du Prix Locataire par le Locataire s’effectue pour chaque
          réservation, par anticipation, par paiement par carte bancaire sur le
          Site via la solution de paiement sécurisée Stripe et dès acceptation
          de l’Offre de réservation par Yachting Day.
        </p>
        <p>
          Par exception, et sous réserve de l’accord expresse de Yachting Day,
          l’Utilisateur pourra payer par virement bancaire, par carte de crédit
          en chèque ou en espèce directement au propriétaire ou à Yachting Day
          le jour de la navigation avant le départ du quai.
        </p>
        <p>
          Le paiement du Prix Locataire par le Locataire s’effectue en une seule
          fois. Par exception, le Locataire peut régler en deux fois si la
          Location débute plus de quarante-cinq (45) jours après la réservation.
          Dans ce cas, le Locataire verse un acompte de cinquante pour cent
          (50%) et le solde vingt (20) jours avant la date de Prise en Main.
        </p>

        <h3>Disponibilité du Service et du Site</h3>
        <p>
          Yachting Day s’engage à faire ses meilleurs efforts pour que le
          Service et le Site soient disponibles 24h/24, 7 jours/7, sans
          interruption autre que celles requises pour les besoins de la
          maintenance curative ou évolutive.
        </p>
        <p>
          L’attention de l’Utilisateur est spécifiquement attirée sur le fait
          que le Site et le Service sont, comme toute application informatique,
          susceptibles de dysfonctionnements, anomalies, erreurs ou
          interruptions pouvant être notamment dus à des problèmes de connexion.
          En conséquence, Yachting Day ne garantit pas à l’Utilisateur que le
          Site et le Service seront disponibles de manière permanente.
        </p>

        <h3>Responsabilité</h3>
        <h4>Limitation de responsabilité</h4>
        <p>
          Sous réserve des exclusions de responsabilité prévues dans les
          présentes CGU, il est convenu qu’en toute hypothèse et quel qu’en soit
          le fondement, la responsabilité que Yachting Day pourrait encourir à
          quelque titre que ce soit en relation avec le Site ou Service ne
          pourra, sauf faute lourde ou dolosive, excéder le montant total
          facturé par Yachting Day à l’Utilisateur lors de la Location de
          laquelle résulte le fait générateur de la responsabilité de Yachting
          Day.
        </p>
        <h4>Exclusions de responsabilité</h4>
        <ul>
          <li>
            Utilisation non conforme ou illicite du Site et/ou du Service par
            l’Utilisateur
          </li>
          <li>Indisponibilité du Site et/ou du Service</li>
          <li>
            Intrusion frauduleuse d’un tiers dans le Site et/ou le Service
          </li>
          <li>
            Non-respect des formalités administratives et sanitaires par
            l’Utilisateur
          </li>
        </ul>

        <h3>Force majeure</h3>
        <ul>
          <li>
            Bulletins météorologiques spéciaux empêchant toutes sorties en mer
          </li>
          <li>Modifications législatives et réglementaires</li>
          <li>
            Catastrophes naturelles, incendies, tempêtes, inondations, guerres
            et actes de terrorisme, maladie, surtensions et chocs électriques,
            pannes des systèmes de refroidissement et des matériels
            informatiques, blocages et ralentissements des réseaux de
            communications électroniques
          </li>
          <li>
            Plus généralement tout fait imprévisible et extérieur à la volonté
            de Yachting Day et des Utilisateurs
          </li>
        </ul>

        <h3>Confidentialité</h3>
        <p>
          Yachting Day s’engage à conserver confidentielle toute information
          recueillie lors de la création du compte Utilisateur. Yachting Day
          s’engage à n’utiliser aucune donnée obtenue de l’Utilisateur pour
          d’autres finalités que celle du Service, et notamment à ne pas
          revendre ces données à des tiers à des fins commerciales, sauf à ce
          que cette utilisation soit requise par la loi ou par toute autorité
          administrative ou judiciaire.
        </p>

        <h3>Suspension / Résiliation</h3>
        <p>
          L’Utilisateur reconnait que Yachting Day est en droit de suspendre
          l’accès au Service ou de résilier ses relations contractuelles avec
          l’Utilisateur, ou de supprimer tout compte Utilisateur, de plein
          droit, par simple courrier électronique et sans autre formalité pour
          tout motif, et notamment en cas d’utilisation non conforme ou illicite
          du Service, de non-respect des CGU, d’annulation de plus de deux
          réservations hors cas de force majeure, ou d’arrêt d’exploitation du
          Site et/ou du Service par Yachting Day.
        </p>
        <p>
          L’Utilisateur peut résilier son compte Utilisateur à tout moment en
          effectuant une demande par mail à l’adresse suivante :
          yachtingday@gmail.com. Toutefois il s’engage à maintenir et assurer
          les réservations en cours ou acceptées.
        </p>

        <h3>Données personnelles</h3>
        <p>
          Conformément à la loi Informatique et Liberté n°78-17 du 6 janvier
          1978, ses décrets d&apos;application et en accord avec le Règlement
          Général sur la Protection des Données (RGPD), l’Utilisateur dispose
          d&apos;un droit d&apos;accès, de modification, de rectification et de
          suppression des données nominatives le concernant, exerçable auprès de
          yachtingday@gmail.com.
        </p>
        <p>
          Yachting Day collecte certaines de vos données personnelles
          conformément à la loi en vigueur et aux informations stipulées dans sa
          Politique de confidentialité. Vous acceptez ce traitement des données
          personnelles et le reconnaissez en utilisant le Site et à la suite de
          votre inscription comme membre.
        </p>

        <h3>Propriété intellectuelle</h3>
        <p>
          « Yachting Day » et le logo figurant sur le Site restent
          l&apos;entière propriété de Yachting Day. Aucune licence n’est
          concédée à l&apos;Utilisateur. Yachting Day est titulaire des droits
          de propriété intellectuelle afférents au Service et au Site, et,
          notamment relatifs aux éléments logiciels, à l’ergonomie, à
          l’agencement, aux éléments graphiques, au logo et au design du Site.
        </p>
        <p>
          L’Utilisateur s&apos;interdit de porter atteinte de quelque façon que
          ce soit aux droits de propriété intellectuelle détenus par Yachting
          Day.
        </p>

        <h3>Droit applicable</h3>
        <p>
          Les présentes CGU sont régies et soumises à la loi française. Les CGU
          sont rédigées en langue française. Toute traduction des CGU ne peut
          revêtir qu’un caractère informatif. Pour toutes contestations
          relatives aux présentes CGU et au cas où, après une tentative d’accord
          amiable, aucune solution ne serait trouvée, l’attribution de
          juridiction sera faite exclusivement aux tribunaux de Draguignan
          (Var).
        </p>
        <p>
          Toute réclamation est à adresser à Yachting Day dans un délai de 24
          heures suivant la prise de possession du Bateau en utilisant l’adresse
          électronique suivante : yachtingday@gmail.com
        </p>
      </div>
    </section>
  </Wrapper>
);

export default page;
