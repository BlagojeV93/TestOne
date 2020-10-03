import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';

const fetchLink = page => `https://api.github.com/gists/public?page=${page}&per_page=20`;

const cardImageSize = 80;

// helper function for setting animation props
function animationProps(toValue, delay) {
  return {
    toValue,
    duration: 1500,
    delay,
    useNativeDriver: true
  }
}

const App = () => {

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedUri, setUri] = useState(null);
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchData()
  }, [page])

  // fetching data
  async function fetchData() {
    let res = await fetch(fetchLink(page)).then(res => res.json()).catch(e => alert(e));
    if (res.message) {
      alert(res.message)
    } else {
      res = res.map(el => {
        return { uri: el.owner.avatar_url, filename: Object.keys(el.files)[0] }
      })
      setData([...data, ...res])
    }
  }

  // handling fadeIn and fadeOut animation
  useEffect(() => {
    if (selectedUri) {
      Animated.timing(opacity, animationProps(1, 0)).start(() => {
        Animated.timing(opacity, animationProps(0, 1000)).start(() => setUri(null))
      })
    }
  }, [selectedUri])

  // load more data
  function fetchMoreData() {
    setPage(prevPage => {
      return prevPage + 1
    })
  }

  // display list of cards or loading indicator
  function mapCards() {
    if (data.length > 0) {
      return (
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          onEndReachedThreshold={3}
          onEndReached={() => fetchMoreData()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setUri(item.uri)}
              activeOpacity={0.5}
              style={styles.cardContainer}
            >
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.uri }} style={styles.imageStyle} />
              </View>
              <Text style={styles.filenameText}>
                {item.filename}
              </Text>
            </TouchableOpacity>
          )}
        />
      )
    } else {
      return (
        <View style={styles.indicatorContainer}>
          <ActivityIndicator size='large' color='gray' />
        </View>
      )
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Gists</Text>
      </View>
      {mapCards()}
      {selectedUri &&
        <View style={styles.selectedImageContainer}>
          <Animated.Image source={{ uri: selectedUri }} style={[styles.imageStyle, { opacity }]} />
        </View>
      }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    backgroundColor: '#F1F1F1'
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 5
  },
  cardContainer: {
    width: '100%',
    flexDirection: 'row',
    height: cardImageSize,
    alignItems: 'center',
    borderBottomWidth: 0.5
  },
  imageContainer: {
    height: '100%',
    width: cardImageSize,
    marginRight: 10,
    padding: 5
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  filenameText: {
    fontSize: 16
  },
  indicatorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectedImageContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 1
  }
});

export default App;
