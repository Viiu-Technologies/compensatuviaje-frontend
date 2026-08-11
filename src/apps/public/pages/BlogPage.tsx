import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchImpactNews, type NewsArticle } from '../services/newsService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './BlogPage.css';

const BlogPage = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadArticles = async () => {
      setLoading(true);
      const data = await fetchImpactNews();
      if (isMounted) {
        setArticles(data);
        setLoading(false);
      }
    };

    loadArticles();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="blog-page">
      <Header />
      <main>
        <section className="blog-hero">
          <div className="blog-hero__panel">
            <span className="blog-hero__eyebrow">Blog de impacto</span>
            <h1 className="blog-hero__title">
              Noticias de Chile y América para empresas que compensan viaje y emisiones.
            </h1>
            <p className="blog-hero__lead">
              Reunimos notas y análisis regionales sobre clima, proyectos ESG y economía verde para mantener el tono del landing y apoyar la misión de CompensaTuViaje.
            </p>
            <div className="blog-hero__actions">
              <Link to="/" className="blog-btn">
                Volver a la landing
              </Link>
              <a
                href="https://www.esgdiario.com/"
                target="_blank"
                rel="noreferrer"
                className="blog-btn blog-btn--outline"
              >
                Ver más noticias de ESG Diario
              </a>
            </div>
          </div>
        </section>

        <section className="blog-insights">
          <article className="blog-insights__card">
            <span className="blog-insights__label">Contenido local</span>
            <p className="blog-insights__text">
              Noticias de Chile tomadas de fuentes regionales para conectar la conversación de la compensación y la sostenibilidad con el contexto nacional.
            </p>
          </article>
          <article className="blog-insights__card">
            <span className="blog-insights__label">Perspectiva latinoamericana</span>
            <p className="blog-insights__text">
              Cobertura de América Latina enfocada en clima, energía limpia y proyectos de carbono que impactan a empresas y comunidades.
            </p>
          </article>
        </section>

        <section className="blog-list">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <article key={index} className="blog-card blog-card--placeholder">
                <div className="blog-card__meta">
                  <div className="blog-card__placeholder-line blog-card__placeholder-line--short" />
                  <div className="blog-card__placeholder-line blog-card__placeholder-line--tiny" />
                </div>
                <div className="blog-card__placeholder-block blog-card__placeholder-block--title" />
                <div className="blog-card__placeholder-block" />
                <div className="blog-card__placeholder-block blog-card__placeholder-block--small" />
                <div className="blog-card__placeholder-block blog-card__placeholder-block--button" />
              </article>
            ))
          ) : articles.length > 0 ? (
            articles.map((article) => (
              <article key={`${article.title}-${article.link}`} className="blog-card">
                <div className="blog-card__meta">
                  <span className="blog-card__badge">{article.source}</span>
                  <span className="blog-card__date">
                    {article.pubDate ? new Date(article.pubDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Reciente'}
                  </span>
                </div>
                <h2 className="blog-card__title">{article.title}</h2>
                <p className="blog-card__description">{article.description}</p>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noreferrer"
                  className="blog-card__link"
                >
                  Leer noticia →
                </a>
              </article>
            ))
          ) : (
            <div className="blog-empty">
              <p>No hay noticias disponibles en este momento. Intenta recargar la página en unos minutos.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
