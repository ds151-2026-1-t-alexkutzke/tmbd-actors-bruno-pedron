import { useLocalSearchParams, Link } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { api } from '../../src/api/tmdb';

interface MovieDetails {
  title: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  runtime: number;
  actors: {
    id: number;
    name: string;
    profile_path: string | null;
  }[];
}

export default function MovieDetailsScreen() {
  // Captura o parâmetro '[id]' do nome do arquivo
  const { id } = useLocalSearchParams();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await api.get(`/movie/${id}`);
        const creditsResponse = await api.get(`/movie/${id}/credits`);
        const topActors = creditsResponse.data.cast
          .slice(0, 5)
          .map((actor: any) => ({
            id: actor.id,
            name: actor.name,
            profile_path: actor.profile_path || null,
          }));

        setMovie({
          ...response.data,
          actors: topActors,
        });
      } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]); // O hook é re-executado caso o ID mude

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Filme não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {movie.poster_path && (
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
          style={styles.poster}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{movie.title}</Text>

        <View style={styles.statsContainer}>
          <Text style={styles.statText}>⭐ {movie.vote_average.toFixed(1)}/10</Text>
          <Text style={styles.statText}>⏱️ {movie.runtime} min</Text>
        </View>

        <Text style={styles.sectionTitle}>Sinopse</Text>
        <Text style={styles.overview}>
          {movie.overview || 'Sinopse não disponível para este filme.'}
        </Text>
        <View>
          <Text style={styles.sectionTitle}>Elenco</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.actorsRow}
          >
            {movie.actors.map((actor) => (
              <Link
                key={actor.id}
                href={{ pathname: '/actor/[id]', params: { id: String(actor.id) } }}
                asChild
              >
              <Pressable>
                <View style={styles.actorCard}>
                  {actor.profile_path ? (
                    <Image
                      source={{ uri: `https://image.tmdb.org/t/p/w500${actor.profile_path}` }}
                      style={styles.actorPhoto}
                      resizeMode="cover"
                    />
                  ) : (
                    <View>
                      <Text>Sem foto</Text>
                    </View>
                  )}
                  <Text style={styles.actorName}> {actor.name} </Text>
                </View>
              </Pressable>
              </Link>
            ))}
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  poster: { width: '100%', height: 400 },
  content: { padding: 20 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  statsContainer: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statText: { color: '#E50914', fontSize: 16, fontWeight: '600' },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  overview: { color: '#D1D5DB', fontSize: 16, lineHeight: 24 },
  errorText: { color: '#FFFFFF', fontSize: 18 },
  actorsRow: { flexDirection: 'row', paddingRight: 8 },
  actorCard: { width: 100, marginRight: 12 },
  actorPhoto: { width: 100, height: 130, borderRadius: 12 },
  actorName: { color: '#D1D5DB', fontSize: 12, marginTop: 6 },
});
