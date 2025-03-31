import Image from "next/image";
import Carousel from "../Carousel/Carousel";
import image1 from "@/public/assets/images/vue-exterieur.webp";
import image2 from "@/public/assets/images/image2.jpg";
import logo from "@/public/assets/logo/hippo.png";
import placeholder from "@/public/assets/images/placeholder.svg";
// Styles
import styles from "./styles.module.scss";
import Link from "next/link";

export const dynamic = "force-dynamic";

const About: React.FC = () => {
  const carouselImages = [
    "/assets/images/image1.jpg",
    "/assets/images/image2.jpg",
    "/assets/images/image3.jpg",
    "/assets/images/image4.jpg",
  ];

  return (
    <div className={styles.about}>
      <div className={styles.logo_title_wrapper}>
        <div className={styles.logo_container}>
          <Image
            src={logo || placeholder}
            alt="Yachting Day Logo"
            className={styles.logo}
            width={200}
            height={100}
          />
        </div>
        <h2 className={styles.title}>Qui Sommes-nous</h2>
      </div>
      <div className={styles.content_wrapper}>
        <div className={styles.content}>
          <div className={styles.text_container}>
            <p>
              Je me nomme Pierre-Yves Hemard, âgé de 39 ans, originaire de la
              région de Saint-Tropez, où j&apos;ai grandi et réside
              actuellement.
            </p>
            <p>
              Depuis mon enfance, je suis passionné par la navigation, ce qui
              m&apos;a conduit à devenir moniteur de voile et régatier assidu. À
              22 ans, j&apos;ai accédé au poste de capitaine sur les pontons de
              Saint-Tropez, affirmant ainsi mon engagement et mes compétences
              dans le domaine maritime.
            </p>
            <p>
              En 2023, j&apos;ai fondé Yachting Day pour mettre à profit mon
              expertise dans la location et l&apos;entretien de bateaux. Grâce à
              mes nombreuses expériences nautiques, que ce soit en bateau à
              moteur ou en voilier, en régate ou en cabotage, je suis en mesure
              de vous offrir le meilleur de mes compétences.
            </p>
            <p>
              Avec une connaissance approfondie de Cavalaire, du golfe de
              Saint-Tropez et de leurs environs, je vous invite à embarquer à
              bord de Skippy One. Ce Cap Camarat 12.5 WA de 2021, équipé de
              trois moteurs hors-bord de 300 chevaux, allie performances
              exceptionnelles et confort optimal. Soigneusement entretenu, il
              vous promet une journée inoubliable en mer.
            </p>
          </div>

          {/* Section des images */}
          <div className={styles.images_container}>
            <Image
              src={image1 || placeholder}
              alt="Pierre-Yves Hemard"
              className={styles.image}
              width={400}
              height={400}
            />
            <Image
              src={image2 || placeholder}
              alt="Skippy One"
              className={styles.image}
              width={400}
              height={400}
            />
          </div>
        </div>

        {/* Carousel */}
        <div className={styles.carousel_container}>
          <Carousel images={carouselImages} />
        </div>

        <div className={styles.additional_info}>
          <p>
            J&apos;aurai à cœur de vous faire découvrir les merveilles de la
            région à bord de Skippy One, dans une ambiance conviviale et
            sécurisée.
          </p>
          <p>
            Soucieux du détail, sérieux et rigoureux, je suis également
            spécialisé dans l&apos;entretien de yachts.
          </p>
          <p>
            Grâce à un réseau de contacts privilégié parmi les meilleurs
            artisans locaux, je vous accompagnerai avec plaisir et facilité dans
            l&apos;entretien de votre bateau.
          </p>
        </div>

        {/* Call to action (CTA) */}
        <div className={styles.cta}>
          <p>Cliquez ci-dessous pour plus d&apos;information.</p>
          <div className={styles.buttons}>
            <Link href="#maintenance" className={styles.button}>
              Entretien de bateaux
            </Link>
            <Link href="#tarifs" className={styles.button}>
              Location de bateaux
            </Link>
            <Link href="#cruise" className={styles.button}>
              Nos excursions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
