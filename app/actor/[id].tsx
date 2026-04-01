import { useLocalSearchParams, Link } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { api } from '../../src/api/tmdb';

interface ActorDetails{
    name: string;
    biography: string;
    profile_path: string | null;
    movies: {
        id: number,
        title: string,
        poster_path: string | null;
    }[]
}

export default function ActorDetailsScreen(){
    const { id } = useLocalSearchParams();
    const [actor, setActor] = useState<ActorDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { 
      const fetchActorDetails = async () => {
      try {
        const response = await api.get(`/person/${id}`);
        const moviesResponse = await api.get(`/person/${id}/movie_credits`);
        const topMovies = moviesResponse.data.cast
          .slice(0, 5)
          .map((movie: any) => ({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path || null,
          }));

        setActor({
          ...response.data,
          movies: topMovies,
        });
      } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActorDetails();
    }, [id]);

    if (isLoading) {
        return (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#E50914" />
          </View>
        );
      }
    
      if (!actor) {
        return (
          <View style={styles.center}>
            <Text style={styles.errorText}>Ator não encontrado.</Text>
          </View>
        );
      }
    
    return (
        <ScrollView style={styles.container}>
          {actor.profile_path && (
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500${actor.profile_path}` }}
              style={styles.poster}
              resizeMode="cover"
            />
          )}
          <View style={styles.content}>
            <Text style={styles.title}>{actor.name}</Text>
    
            <Text style={styles.sectionTitle}>Biografia</Text>
            <Text style={styles.overview}>
              {actor.biography || 'Biografia não disponível para este ator.'}
            </Text>
            <View>
              <Text style={styles.sectionTitle}>Filmografia</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.moviesRow}
              >
                {actor.movies.map((movie) => (
                  <Link
                    key={movie.id}
                    href={{ pathname: '/movie/[id]', params: { id: String(movie.id) } }}
                    asChild
                  >
                  <Pressable>
                    <View style={styles.movieCard}>
                      {movie.poster_path ? (
                        <Image
                          source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
                          style={styles.moviePhoto}
                          resizeMode="cover"
                        />
                      ) : (
                        <View>
                          <Text>Sem foto</Text>
                        </View>
                      )}
                      <Text style={styles.movieName}> {movie.title} </Text>
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
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  overview: { color: '#D1D5DB', fontSize: 16, lineHeight: 24 },
  errorText: { color: '#FFFFFF', fontSize: 18 },
  moviesRow: { flexDirection: 'row', paddingRight: 8 },
  movieCard: { width: 100, marginRight: 12 },
  moviePhoto: { width: 100, height: 130, borderRadius: 12 },
  movieName: { color: '#D1D5DB', fontSize: 12, marginTop: 6 },
});